var RpcSetupScreen = React.createClass({
    getInitialState: function() {
        return {
            nodeUrl: localStorage.getItem("nodeUrl") || "",
            loading: false,
            error: "",
            success: ""
        };
    },
    validateNode: function() {
        var self = this;
        var nodeUrl = (this.state.nodeUrl || "").trim();
        if (!nodeUrl) {
            this.setState({ error: "Please paste your Base Mainnet RPC URL.", success: "" });
            return;
        }
        this.setState({ loading: true, error: "", success: "" });
        setTimeout(async function() {
            try {
                if(8453 !== parseInt(await (new Web3Browser(nodeUrl)).eth.getChainId())) {
                    throw new Error();
                }
            } catch(e) {
                self.setState({
                    loading: false,
                    error: "This endpoint does not look like a Base Mainnet RPC URL.",
                    success: ""
                });
                return;
            }
            localStorage.setItem("nodeUrl", nodeUrl);
            (window.web3 = window.web3 || new Web3Browser()).setProvider(new web3.providers.HttpProvider(nodeUrl));
            self.setState({
                loading: false,
                error: "",
                success: "Base Mainnet RPC saved. Your dashboard is ready."
            });
            setTimeout(function() {
                self.props.onSaved(nodeUrl);
            }, 500);
        });
    },
    render: function() {
        return (
            <div className = "rpc-page">
                <div className = "rpc-card glass-card card-pad">
                    <div className = "rpc-hero">
                        <i className = "fa-solid fa-link"></i>
                    </div>
                    <div className = "card-header">
                        <div>
                            <h2 className = "card-title">Set your Base Mainnet RPC</h2>
                            <div className = "card-copy">Before the dashboard can load, it needs a network endpoint. This is a one-time setup.</div>
                        </div>
                    </div>
                    <div className = "rpc-hint">
                        <div className = "helper-text">You can visit ChainList website to obtain a free RPC endpoint or (<b style={{"text-decoration" : "underline"}}>highly recommended</b>) you can visit the official Base documentation to find out how to create a custom RPC.</div>
                        <div style = {{ marginTop: "8px" }}>
                            <a href = "https://chainlist.org/chain/base/" target = "_blank" rel = "noreferrer">ChainList Base <i className = "fa-solid fa-arrow-up-right-from-square"></i></a>
                            {"\u00a0"}{"\u00a0"}{"\u00a0"}
                            <a href = "https://docs.base.org/base-chain/node-operators/node-providers/" target = "_blank" rel = "noreferrer">Base Node Providers <i className = "fa-solid fa-arrow-up-right-from-square"></i></a>
                        </div>
                    </div>
                    <div className = "section-divider"></div>
                    <div className = "form-stack">
                        <div className = "field-shell primary-glow">
                            <div className = "field-label-row">
                                <div className = "field-label">RPC URL</div>
                            </div>
                            <div className = "field-input-row">
                                <input
                                    className = "text-input"
                                    type = "text"
                                    placeholder = "https://your.rpc.url/"
                                    value = {this.state.nodeUrl}
                                    onChange = {function(e) {
                                        this.setState({ nodeUrl: e.target.value, error: "", success: "" });
                                    }.bind(this)}
                                />
                            </div>
                        </div>
                        <button className = "button-base button-primary" onClick = {this.validateNode} disabled = {this.state.loading}>
                            <i className = {this.state.loading ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-check"}></i>
                            {this.state.loading ? "Validating endpoint" : "Save and validate"}
                        </button>
                        {this.state.error ? <div className = "status-pill danger"><i className = "fa-solid fa-circle-exclamation"></i>{this.state.error}</div> : null}
                        {this.state.success ? <div className = "status-pill success"><i className = "fa-solid fa-circle-check"></i>{this.state.success}</div> : null}
                        <div className = "muted-2">The app expects Base Mainnet. If the endpoint is unavailable or points to a different chain, setup will not continue.</div>
                    </div>
                </div>
            </div>
        );
    }
});
