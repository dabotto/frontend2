var AddLiquidityCard = React.createClass({
    getInitialState: function() {
        return {
            amount: "0"
        };
    },
    setMax: function() {
        if (!this.props.token) {
            return;
        }
        this.setState({ amount: this.props.balance});
    },
    render: function() {
        var token = this.props.token;
        var balance = (token && this.props.balance) || "0";
        var allowance = (token && this.props.allowance) || '0';
        var isEth = token && token.symbol === "ETH";
        var approved = token && (isEth || this.props.approvedTokens[token.address]);
        approved = parseInt(allowance) >= parseInt(this.state.amount || 0);
        var approveDisabled = !token || isEth || approved;
        var addDisabled = !token || !this.state.amount || parseFloat(this.state.amount || "0") <= 0 || (!isEth && !approved);
        var approvePrimary = token && !isEth && !approved;
        return (
            <div style = {{ marginTop: "12px" }}>
                <div className = "card-header">
                    <div>
                        <h3 className = "card-title">Add liquidity</h3>
                        <div className = "card-copy">One token, one amount, one clear next step.</div>
                    </div>
                </div>
                <div className = "form-stack">
                    <button className = "select-token-button" onClick = {function() { this.props.onOpenPicker("addLiquidity"); }.bind(this)}>
                        {token ? (
                            <>
                                <div className = "select-left">
                                    <div className = "token-avatar">{token.symbol.slice(0, 3)}</div>
                                    <div className = "token-meta">
                                        <div className = "token-name">{token.name}</div>
                                        <div className = "token-subline">{token.symbol} · {shortAddress(token.address)}</div>
                                    </div>
                                </div>
                                <i className = "fa-solid fa-chevron-down"></i>
                            </>
                        ) : (
                            <>
                                <div className = "select-left">
                                    <div className = "token-avatar"><i className = "fa-solid fa-coins"></i></div>
                                    <div className = "token-meta">
                                        <div className = "token-name">Select token</div>
                                        <div className = "token-subline">Choose the asset you want to add</div>
                                    </div>
                                </div>
                                <i className = "fa-solid fa-chevron-down"></i>
                            </>
                        )}
                    </button>
                    <div className = "field-shell primary-glow">
                        <div className = "field-label-row">
                            <div className = "field-label">Amount</div>
                            <button className = "max-chip" onClick = {this.setMax} disabled = {!token}>MAX</button>
                        </div>
                        <div className = "field-input-row">
                            <input
                                className = "amount-input"
                                type = "number"
                                min = "0"
                                step = "any"
                                placeholder = "0.00"
                                value = {fromDecimals(this.state.amount, token?.decimals, true)}
                                onChange = {function(e) { !isNaN(parseFloat(e.target.value)) && this.setState({ amount: toDecimals(e.target.value, token?.decimals) }); }.bind(this)}
                            />
                            <div className = "token-chip">{token ? token.symbol : "TOKEN"}</div>
                        </div>
                    </div>
                    <div className = "balance-box">
                        <div className = "field-label">Available balance</div>
                        <div className = "kpi-value">{token ? balance ? (fromDecimals(balance, token.decimals, true) + " " + token.symbol) : "Loading balance..." : "Select a token first"}</div>
                    </div>
                    <div className = "kpi-row">
                        <div className = "kpi-item">
                            <div className = "kpi-label">Approval status</div>
                            <div className = "kpi-value">{!token ? "Waiting" : isEth ? "Not needed" : approved ? "Ready" : "Required"}</div>
                        </div>
                        <div className = "kpi-item">
                            <div className = "kpi-label">Next action</div>
                            <div className = "kpi-value">{!token ? "Pick token" : approvePrimary ? "Approve" : "Add liquidity"}</div>
                        </div>
                    </div>
                    {this.props.toast ? <div className = "status-pill success"><i className = "fa-solid fa-circle-check"></i>{this.props.toast}</div> : null}
                    <div className = "cta-row">
                        <button className = {"button-base " + (approvePrimary ? "button-primary" : "button-secondary")} disabled = {approveDisabled} onClick = {function() { this.props.onApprove(token.address, this.state.amount); }.bind(this)}>
                            <i className = "fa-solid fa-badge-check"></i>
                            Approve
                        </button>
                        <button onClick={() => this.props.onAddLiquidity(token.address, this.state.amount)} className = {"button-base " + (!approvePrimary ? "button-primary" : "button-secondary")} disabled = {addDisabled}>
                            <i className = "fa-solid fa-plus"></i>
                            Add Liquidity
                        </button>
                    </div>
                    <div className = "muted-2">Approve is skipped for ETH. For any other token, approval comes first when needed.</div>
                </div>
            </div>
        );
    }
});
