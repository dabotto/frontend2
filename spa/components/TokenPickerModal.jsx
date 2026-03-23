var TokenPickerModal = React.createClass({
    getInitialState: function() {
        return {
            query: "",
            customAddress: "",
            loading: true,
            savingCustom: false,
            error: "",
            customError: "",
            cacheVersion: Date.now()
        };
    },
    componentDidMount: function() {
        this.refreshCache();
    },
    refreshCache: function() {
        var self = this;
        this.setState({ loading: true, error: "" });
        ensureDefaultTokenCache(function() {
            self.setState({ loading: false, cacheVersion: Date.now() });
        });
    },
    getTokens: function() {
        var cache = getStoredTokenMeta();
        var addresses = getAllTokenAddresses();
        return addresses.map(function(address) {
            return cache[address] || {
                address: address,
                name: "Loading token",
                symbol: "...",
                isCustom: false
            };
        }).filter(Boolean);
    },
    handleAddCustom(address) {
        var self = this;
        address = (address || this.state.customAddress || "").trim();
        if (!isValidAddress(address)) {
            this.setState({ customError: "Please enter a valid token address." });
            return;
        }
        var existing = getAllTokenAddresses();
        if (existing.indexOf(address) !== -1) {
            this.setState({ customError: "This token is already in the list." });
            return;
        }
        this.setState({ savingCustom: true, customError: "" });
        fetchTokenMeta(address).then(function(meta) {
            meta.isCustom = true;
            saveTokenMeta(meta);
            var customTokens = readJsonStorage("customTokenAddresses", []);
            customTokens.push(address);
            writeJsonStorage("customTokenAddresses", customTokens);
            self.setState({
                savingCustom: false,
                customAddress: "",
                cacheVersion: Date.now()
            });
            self.props.onTokensChanged();
        }).catch(function(error) {
            self.setState({
                savingCustom: false,
                customError: error.message || "This token could not be loaded."
            });
        });
    },
    handleRemoveCustom: function(address, e) {
        e.stopPropagation();
        var customTokens = readJsonStorage("customTokenAddresses", []).filter(function(item) {
            return item !== address;
        });
        writeJsonStorage("customTokenAddresses", customTokens);
        this.setState({ cacheVersion: Date.now() });
        this.props.onTokensChanged();
    },
    onQuery(query) {
        var self = this;
        var done = function() {
            self.setState({query});
        };
        return isValidAddress(query) ? this.handleAddCustom(query).then(done) : done();
    },
    renderList: function() {
        var self = this;
        var query = (this.state.query || "").toLowerCase();
        var tokens = this.getTokens().filter(function(token) {
            return !query || token.name.toLowerCase().indexOf(query) !== -1 || token.symbol.toLowerCase().indexOf(query) !== -1 || token.address.toLowerCase().indexOf(query) !== -1;
        });
        if (this.state.loading) {
            return <div className = "empty-state"><div className = "helper-text"><i className = "fa-solid fa-spinner fa-spin"></i> Loading token details</div></div>;
        }
        if (!tokens.length) {
            return <div className = "empty-state"><div className = "helper-text">No token matches this search yet.</div></div>;
        }
        return (
            <div className = "token-list">
                {tokens.map(function(token) {
                    var selected = self.props.selectedAddress === token.address;
                    return (
                        <button key = {token.address} className = {"token-row" + (selected ? " selected" : "")} onClick = {function() { self.props.onSelect(token.address); }}>
                            <div className = "token-row-main">
                                <div className = "token-avatar">{token.symbol.slice(0, 3)}</div>
                                <div className = "token-meta">
                                    <div className = "token-name">{token.name}</div>
                                    <div className = "token-subline">{token.symbol} · {shortAddress(token.address)}</div>
                                </div>
                            </div>
                            <div className = "token-right">
                                {token.isCustom ? <button className = "remove-chip" onClick = {function(e) { self.handleRemoveCustom(token.address, e); }}><i className = "fa-solid fa-trash"></i></button> : null}
                                {selected ? <i className = "fa-solid fa-circle-check"></i> : <i className = "fa-solid fa-chevron-right"></i>}
                            </div>
                        </button>
                    );
                })}
            </div>
        );
    },
    render: function() {
        return (
            <div className = "modal-backdrop" onClick = {this.props.onClose}>
                <div className = "modal-sheet" onClick = {function(e) { e.stopPropagation(); }}>
                    <div className = "modal-handle"></div>
                    <div className = "modal-scroll">
                        <div className = "card-header">
                            <div>
                                <h3 className = "card-title">Select token</h3>
                                <div className = "card-copy">Search, pick, or add a custom token address.</div>
                            </div>
                            <button className = "small-chip" onClick = {this.props.onClose}><i className = "fa-solid fa-xmark"></i>Close</button>
                        </div>
                        <div className = "search-shell">
                            <i className = "fa-solid fa-magnifying-glass"></i>
                            <input
                                className = "text-input"
                                type = "text"
                                placeholder = "Search by name, symbol, or address"
                                value = {this.state.query}
                                onChange = {e => this.onQuery(e.currentTarget.value)}
                            />
                        </div>
                        {this.renderList()}
                        {/*<div className = "section-divider"></div>
                        <div className = "card-header" style = {{ marginBottom: "10px" }}>
                            <div>
                                <h3 className = "card-title" style = {{ fontSize: "16px" }}>Add custom token</h3>
                                <div className = "card-copy">Paste an address and save it for later use on this device.</div>
                            </div>
                        </div>
                        <div className = "form-stack">
                            <div className = "field-shell">
                                <div className = "field-label-row">
                                    <div className = "field-label">Token address</div>
                                </div>
                                <div className = "field-input-row">
                                    <input
                                        className = "text-input"
                                        type = "text"
                                        placeholder = "0x..."
                                        value = {this.state.customAddress}
                                        onChange = {function(e) { this.setState({ customAddress: e.target.value, customError: "" }); }.bind(this)}
                                    />
                                </div>
                            </div>
                            <button className = "button-base button-secondary" onClick = {this.handleAddCustom} disabled = {this.state.savingCustom}>
                                <i className = {this.state.savingCustom ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-plus"}></i>
                                {this.state.savingCustom ? "Saving token" : "Add custom token"}
                            </button>
                            {this.state.customError ? <div className = "status-pill danger"><i className = "fa-solid fa-circle-exclamation"></i>{this.state.customError}</div> : null}
                            <div className = "muted-2">{"\u00a0"}</div>
                        </div>*/}
                    </div>
                </div>
            </div>
        );
    }
});
