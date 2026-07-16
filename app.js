(function () {
  "use strict";

  const config = window.PRIMESCRIPTLAB_CONFIG;
  const ORDERS_KEY = "primescriptlab:orders";
  const SELECTED_ORDER_KEY = "primescriptlab:selected-order";

  const state = {
    selectedOrder: null,
    paypalLoaded: false,
    paypalRenderedFor: ""
  };

  const serviceGrid = document.querySelector("#serviceGrid");
  const packageGrid = document.querySelector("#packageGrid");
  const comparisonRows = document.querySelector("#comparisonRows");
  const packageSelect = document.querySelector("#packageSelect");
  const languageSelect = document.querySelector("#languageSelect");
  const scriptTypeSelect = document.querySelector("#scriptTypeSelect");
  const addonGrid = document.querySelector("#addonGrid");
  const orderForm = document.querySelector("#orderForm");
  const quoteTotal = document.querySelector("#quoteTotal");
  const quoteBreakdown = document.querySelector("#quoteBreakdown");
  const paymentTotal = document.querySelector("#paymentTotal");
  const selectedOrderSummary = document.querySelector("#selectedOrderSummary");
  const paypalStatus = document.querySelector("#paypalStatus");
  const paypalButtons = document.querySelector("#paypalButtons");
  const paypalMeLink = document.querySelector("#paypalMeLink");
  const ordersList = document.querySelector("#ordersList");
  const orderBadge = document.querySelector("#orderBadge");
  const formError = document.querySelector("#formError");
  const orderDialog = document.querySelector("#orderDialog");
  const dialogTitle = document.querySelector("#dialogTitle");
  const dialogBody = document.querySelector("#dialogBody");

  function money(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: config.currency,
      maximumFractionDigits: 0
    }).format(value);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function readOrders() {
    try {
      return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
    } catch {
      return [];
    }
  }

  function writeOrders(orders) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }

  function getPackage(id) {
    return config.packages.find((item) => item.id === id) || config.packages[1] || config.packages[0];
  }

  function selectedPackage() {
    return getPackage(packageSelect.value);
  }

  function selectedAddonIds() {
    return Array.from(orderForm.querySelectorAll('input[name="addons"]:checked')).map((input) => input.value);
  }

  function calculateQuote() {
    const activePackage = selectedPackage();
    const addons = config.addons.filter((item) => selectedAddonIds().includes(item.id));
    const integrationCount = Math.max(0, Math.min(8, Number(orderForm.integrations.value || 0)));
    const integrationCost = integrationCount * config.integrationPrice;
    const deliveryMode = orderForm.delivery.value;
    const rushAddon = deliveryMode === "rush" ? 20 : 0;
    const flexibleDiscount = deliveryMode === "flexible" ? config.flexibleDiscount : 0;
    const addonTotal = addons.reduce((sum, addon) => sum + addon.price, 0);
    const total = Math.max(5, activePackage.price + addonTotal + integrationCost + rushAddon - flexibleDiscount);

    const lines = [
      {
        label: `${activePackage.name}: ${activePackage.title}`,
        detail: `${activePackage.deliveryDays} day delivery, ${activePackage.revisions} revision${activePackage.revisions === 1 ? "" : "s"}`,
        value: activePackage.price
      }
    ];

    addons.forEach((addon) => {
      lines.push({ label: addon.label, detail: addon.description, value: addon.price });
    });

    if (integrationCount > 0) {
      lines.push({
        label: "Extra integrations",
        detail: `${integrationCount} integration${integrationCount === 1 ? "" : "s"} at ${money(config.integrationPrice)} each`,
        value: integrationCost
      });
    }

    if (deliveryMode === "rush") {
      lines.push({ label: "Rush delivery mode", detail: "Additional priority added to this order.", value: rushAddon });
    }

    if (deliveryMode === "flexible") {
      lines.push({ label: "Flexible schedule", detail: "Discount for non-urgent work.", value: -flexibleDiscount });
    }

    return { total, lines, addons, integrationCount, activePackage };
  }

  function renderQuote() {
    const quote = calculateQuote();
    quoteTotal.textContent = money(quote.total);
    paymentTotal.textContent = money(state.selectedOrder ? state.selectedOrder.total : quote.total);

    quoteBreakdown.innerHTML = quote.lines
      .map((line) => {
        const amount = line.value > 0 ? money(line.value) : line.value < 0 ? `-${money(Math.abs(line.value))}` : "Included";
        return `
          <div class="quote-line">
            <span>
              <strong>${escapeHtml(line.label)}</strong>
              <small>${escapeHtml(line.detail)}</small>
            </span>
            <b>${amount}</b>
          </div>
        `;
      })
      .join("");

    renderSelectedOrder();
  }

  function renderServices() {
    serviceGrid.innerHTML = config.services
      .map(
        (service) => `
          <article class="service-card">
            <div>
              <h3>${escapeHtml(service.title)}</h3>
              <p>${escapeHtml(service.detail)}</p>
            </div>
            <div class="tag-row">
              ${service.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
            </div>
          </article>
        `
      )
      .join("");
  }

  function renderPackages() {
    packageGrid.innerHTML = config.packages
      .map(
        (pack) => `
          <article class="package-card ${pack.featured ? "is-featured" : ""}">
            <span class="package-label">${escapeHtml(pack.name)}</span>
            <h3>${escapeHtml(pack.title)}</h3>
            <strong class="package-price">${money(pack.price)}</strong>
            <p>${escapeHtml(pack.description)}</p>
            <div class="package-meta">
              <span>${pack.deliveryDays} day delivery</span>
              <span>${pack.revisions} revision${pack.revisions === 1 ? "" : "s"}</span>
            </div>
            <ul class="feature-list">
              ${featureLabels(pack).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
            <button type="button" class="button ${pack.featured ? "primary" : "secondary light"}" data-select-package="${pack.id}">
              Select ${escapeHtml(pack.name)}
            </button>
          </article>
        `
      )
      .join("");
  }

  function featureLabels(pack) {
    const labels = ["Source code", "Setup notes", "Basic testing"];
    if (pack.features.installScript) labels.push("Install script");
    if (pack.features.taskAutomation) labels.push("Task automation");
    if (pack.features.apiIntegration) labels.push("API integration");
    return labels;
  }

  function renderComparison() {
    const rows = [
      ["Source code", "sourceCode"],
      ["Setup notes", "setupNotes"],
      ["Basic testing", "testing"],
      ["Install script", "installScript"],
      ["Task automation", "taskAutomation"],
      ["API integration", "apiIntegration"],
      ["Revisions", "revisions"],
      ["Delivery time", "delivery"]
    ];

    comparisonRows.innerHTML = rows
      .map((row) => {
        const cells = config.packages
          .map((pack) => {
            const value = pack.features[row[1]];
            if (value === true) return '<td><span class="yes">Yes</span></td>';
            if (value === false) return '<td><span class="no">No</span></td>';
            return `<td>${escapeHtml(value)}</td>`;
          })
          .join("");
        return `<tr><td>${escapeHtml(row[0])}</td>${cells}</tr>`;
      })
      .join("");
  }

  function renderFormOptions() {
    packageSelect.innerHTML = config.packages.map((pack) => `<option value="${pack.id}">${pack.name} - ${pack.title}</option>`).join("");
    packageSelect.value = config.packages.find((pack) => pack.featured)?.id || config.packages[0].id;
    languageSelect.innerHTML = config.languages.map((language) => `<option value="${language}">${language}</option>`).join("");
    scriptTypeSelect.innerHTML = config.scriptTypes.map((type) => `<option value="${type}">${type}</option>`).join("");

    addonGrid.innerHTML = config.addons
      .map(
        (addon) => `
          <label class="addon-option">
            <input type="checkbox" name="addons" value="${addon.id}">
            <span>
              <strong>${escapeHtml(addon.label)}</strong>
              <small>${escapeHtml(addon.description)}</small>
            </span>
            <b class="addon-price">${money(addon.price)}</b>
          </label>
        `
      )
      .join("");
  }

  function validateOrder(formData) {
    const name = String(formData.get("clientName") || "").trim();
    const email = String(formData.get("clientEmail") || "").trim();
    const description = String(formData.get("description") || "").trim();

    if (name.length < 3) return "Enter the client's full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid client email.";
    if (description.length < 40) return "Describe the script in at least 40 characters.";
    return "";
  }

  function createOrder(formData) {
    const quote = calculateQuote();
    return {
      id: `PSL-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      status: "New request",
      clientName: String(formData.get("clientName") || "").trim(),
      clientEmail: String(formData.get("clientEmail") || "").trim(),
      packageId: quote.activePackage.id,
      packageName: quote.activePackage.name,
      packageTitle: quote.activePackage.title,
      language: String(formData.get("language") || ""),
      scriptType: String(formData.get("scriptType") || ""),
      addons: quote.addons.map((addon) => addon.label),
      integrations: quote.integrationCount,
      deliveryMode: String(formData.get("delivery") || "normal"),
      description: String(formData.get("description") || "").trim(),
      total: quote.total,
      currency: config.currency
    };
  }

  function saveOrder(order) {
    const orders = readOrders();
    orders.unshift(order);
    writeOrders(orders);
    setSelectedOrder(order);
    renderOrders();
  }

  function setSelectedOrder(order) {
    state.selectedOrder = order;
    if (order) {
      localStorage.setItem(SELECTED_ORDER_KEY, JSON.stringify(order));
    } else {
      localStorage.removeItem(SELECTED_ORDER_KEY);
    }
    renderSelectedOrder();
  }

  function restoreSelectedOrder() {
    try {
      state.selectedOrder = JSON.parse(localStorage.getItem(SELECTED_ORDER_KEY));
    } catch {
      state.selectedOrder = null;
    }
  }

  function renderSelectedOrder() {
    const quote = calculateQuote();
    const active = state.selectedOrder || {
      id: "Draft order",
      packageName: quote.activePackage.name,
      packageTitle: quote.activePackage.title,
      language: languageSelect.value,
      scriptType: scriptTypeSelect.value,
      total: quote.total,
      description: "Fill out and save the order form, then continue to payment."
    };

    paymentTotal.textContent = money(active.total);
    selectedOrderSummary.innerHTML = `
      <div class="selected-line">
        <span><strong>${escapeHtml(active.id)}</strong><small>${escapeHtml(active.packageName)} - ${escapeHtml(active.packageTitle)}</small></span>
        <b>${money(active.total)}</b>
      </div>
      <div class="selected-line">
        <span><strong>${escapeHtml(active.scriptType)}</strong><small>${escapeHtml(active.language || "Choose a language")}</small></span>
        <b>${escapeHtml(active.status || "Draft")}</b>
      </div>
    `;

    renderPayPal();
  }

  function renderOrders() {
    const orders = readOrders();
    orderBadge.textContent = String(orders.length);

    if (orders.length === 0) {
      ordersList.innerHTML = `
        <section class="empty-state">
          <p class="eyebrow">No orders yet</p>
          <h3>Saved requests will appear here.</h3>
          <p>Use the order form to create a request. This local dashboard is for demo and testing until you connect a real backend.</p>
        </section>
      `;
      return;
    }

    ordersList.innerHTML = orders
      .map(
        (order) => `
          <article class="order-card">
            <div class="order-card-head">
              <div>
                <span>${escapeHtml(order.id)}</span>
                <h3>${escapeHtml(order.packageName)} ${escapeHtml(order.scriptType)}</h3>
              </div>
              <strong>${money(order.total)}</strong>
            </div>
            <dl class="order-meta">
              <div><dt>Client</dt><dd>${escapeHtml(order.clientName)}</dd></div>
              <div><dt>Language</dt><dd>${escapeHtml(order.language)}</dd></div>
              <div><dt>Delivery</dt><dd>${escapeHtml(order.deliveryMode)}</dd></div>
              <div><dt>Status</dt><dd>${escapeHtml(order.status)}</dd></div>
            </dl>
            <p>${escapeHtml(order.description)}</p>
            <div class="form-actions">
              <button type="button" class="button primary" data-pay-order="${order.id}">Pay this order</button>
              <a class="button secondary light" href="mailto:${encodeURIComponent(config.contactEmail)}?subject=${encodeURIComponent(`Order ${order.id}`)}&body=${encodeURIComponent(orderSummary(order))}">Email summary</a>
            </div>
          </article>
        `
      )
      .join("");
  }

  function orderSummary(order) {
    return [
      `Order: ${order.id}`,
      `Client: ${order.clientName}`,
      `Email: ${order.clientEmail}`,
      `Package: ${order.packageName} - ${order.packageTitle}`,
      `Language: ${order.language}`,
      `Script type: ${order.scriptType}`,
      `Add-ons: ${order.addons.length ? order.addons.join(", ") : "None"}`,
      `Integrations: ${order.integrations}`,
      `Total: ${money(order.total)}`,
      "",
      order.description
    ].join("\n");
  }

  function renderDialog(order) {
    dialogTitle.textContent = `Order ${order.id}`;
    dialogBody.innerHTML = `
      <p><strong>${escapeHtml(order.packageName)} ${escapeHtml(order.scriptType)}</strong> was saved with an estimated total of <strong>${money(order.total)}</strong>.</p>
      <p>Use the payment button to test PayPal checkout after your PayPal client ID is configured.</p>
    `;

    if (typeof orderDialog.showModal === "function") {
      orderDialog.showModal();
    } else {
      orderDialog.setAttribute("open", "");
    }
  }

  function paypalReady() {
    return config.paypal.clientId && config.paypal.clientId !== "YOUR_PAYPAL_CLIENT_ID";
  }

  function renderPayPal() {
    paypalButtons.innerHTML = "";
    paypalMeLink.classList.add("hidden");

    const active = state.selectedOrder;
    if (!active) {
      paypalStatus.innerHTML = "Save an order first, then the selected checkout will be ready here.";
      return;
    }

    if (!paypalReady()) {
      paypalStatus.innerHTML = `
        <strong>PayPal is not connected yet.</strong>
        Replace <code>YOUR_PAYPAL_CLIENT_ID</code> in <code>config.js</code> with your live PayPal client ID.
      `;

      if (config.paypal.paypalMe) {
        paypalMeLink.href = `${config.paypal.paypalMe.replace(/\/$/, "")}/${active.total}`;
        paypalMeLink.classList.remove("hidden");
      }
      return;
    }

    paypalStatus.innerHTML = "Loading PayPal checkout for the selected order.";
    loadPayPalSdk()
      .then(() => {
        if (!window.paypal) {
          paypalStatus.innerHTML = "PayPal script loaded, but the PayPal buttons were not available.";
          return;
        }

        const renderKey = `${active.id}:${active.total}`;
        if (state.paypalRenderedFor === renderKey) return;
        state.paypalRenderedFor = renderKey;
        paypalButtons.innerHTML = "";
        paypalStatus.innerHTML = "PayPal checkout is ready.";

        window.paypal
          .Buttons({
            style: {
              layout: "vertical",
              shape: "rect",
              label: "pay"
            },
            createOrder: function (_data, actions) {
              return actions.order.create({
                purchase_units: [
                  {
                    description: `${active.id} - ${active.packageName} ${active.scriptType}`,
                    amount: {
                      currency_code: config.currency,
                      value: String(active.total)
                    }
                  }
                ]
              });
            },
            onApprove: function (_data, actions) {
              return actions.order.capture().then(function () {
                markOrderPaid(active.id);
                paypalStatus.innerHTML = "<strong>Payment captured.</strong> The local order status was updated to Paid.";
              });
            },
            onError: function () {
              paypalStatus.innerHTML = "PayPal returned an error. Check your client ID and account setup.";
            }
          })
          .render("#paypalButtons");
      })
      .catch(() => {
        paypalStatus.innerHTML = "Could not load PayPal. Check your internet connection and PayPal client ID.";
      });
  }

  function loadPayPalSdk() {
    if (state.paypalLoaded || window.paypal) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      const clientId = encodeURIComponent(config.paypal.clientId);
      const currency = encodeURIComponent(config.currency);
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
      script.onload = () => {
        state.paypalLoaded = true;
        resolve();
      };
      script.onerror = reject;
      document.head.append(script);
    });
  }

  function markOrderPaid(orderId) {
    const orders = readOrders();
    const updated = orders.map((order) => (order.id === orderId ? { ...order, status: "Paid" } : order));
    writeOrders(updated);
    const paidOrder = updated.find((order) => order.id === orderId);
    if (paidOrder) setSelectedOrder(paidOrder);
    renderOrders();
  }

  function selectPackage(packageId) {
    packageSelect.value = packageId;
    renderQuote();
    document.querySelector("#order").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function exportCsv() {
    const orders = readOrders();
    if (orders.length === 0) return;

    const columns = ["id", "createdAt", "status", "clientName", "clientEmail", "packageName", "language", "scriptType", "total", "description"];
    const rows = [
      columns.join(","),
      ...orders.map((order) =>
        columns
          .map((column) => `"${String(order[column] || "").replaceAll('"', '""')}"`)
          .join(",")
      )
    ];

    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "primescriptlab-orders.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function copyCurrentSummary() {
    const formData = new FormData(orderForm);
    const error = validateOrder(formData);
    if (error) {
      formError.textContent = error;
      return;
    }

    formError.textContent = "";
    const draft = createOrder(formData);
    navigator.clipboard
      .writeText(orderSummary(draft))
      .then(() => {
        formError.textContent = "Order summary copied.";
      })
      .catch(() => {
        formError.textContent = "Could not copy automatically. Save the request first.";
      });
  }

  function attachEvents() {
    document.addEventListener("click", (event) => {
      const packageButton = event.target.closest("[data-select-package]");
      const payOrderButton = event.target.closest("[data-pay-order]");

      if (packageButton) {
        selectPackage(packageButton.dataset.selectPackage);
      }

      if (payOrderButton) {
        const order = readOrders().find((item) => item.id === payOrderButton.dataset.payOrder);
        if (order) {
          setSelectedOrder(order);
          document.querySelector("#payment").scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });

    orderForm.addEventListener("input", renderQuote);
    orderForm.addEventListener("change", renderQuote);

    orderForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(orderForm);
      const error = validateOrder(formData);
      if (error) {
        formError.textContent = error;
        return;
      }

      formError.textContent = "";
      const order = createOrder(formData);
      saveOrder(order);
      renderDialog(order);
    });

    document.querySelector("#paySelectedButton").addEventListener("click", () => {
      document.querySelector("#payment").scrollIntoView({ behavior: "smooth", block: "start" });
    });

    document.querySelector("#copySummaryButton").addEventListener("click", copyCurrentSummary);
    document.querySelector("#exportCsvButton").addEventListener("click", exportCsv);

    document.querySelector("#clearOrdersButton").addEventListener("click", () => {
      writeOrders([]);
      setSelectedOrder(null);
      renderOrders();
    });

    document.querySelector("#closeDialogButton").addEventListener("click", () => orderDialog.close());
    document.querySelector("#dialogPaymentButton").addEventListener("click", () => {
      orderDialog.close();
      document.querySelector("#payment").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    document.querySelector("#dialogDashboardButton").addEventListener("click", () => {
      orderDialog.close();
      document.querySelector("#dashboard").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function init() {
    renderServices();
    renderPackages();
    renderComparison();
    renderFormOptions();
    restoreSelectedOrder();
    attachEvents();
    renderQuote();
    renderOrders();
  }

  init();
})();
