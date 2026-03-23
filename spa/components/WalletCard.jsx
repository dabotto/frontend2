var WalletCard = React.createClass({
    componentDidMount() {
        var self = this;
        var options = {
            networks: [window.appKit.networks.base],
            projectId: "241b9f6e74b7ca5cb7eadeaa6081b54d",
            defaultNetwork: window.appKit.networks.base
        };
        (window.walletModal = window.appKit.createAppKit({
            ...options,
            adapters: [new window.appKit.WagmiAdapter(options)]
        })).subscribeState(state => self.onWalletState(window.walletModal, state));
    },
    onWalletState(modal, state) {
        if(!modal || state?.loading) {
            return;
        }
        if(!state.open && !modal.getIsConnectedState()) {
            return modal.open({view:"Connect"}).then();
        }
        var address = modal.getAddress();
        if(this.props.walletAddress !== address) {
            if(address) {
                (window.web3 = window.web3 || new Web3Browser()).setProvider(modal.getWalletProvider());
            }
            this.props.onWallet(address);
        }
    },
    renderConnected: function() {
        return (
            <div className = "action-grid">
                <div className = "balance-box">
                    <div className = "field-label">Wallet connected</div>
                    <div style = {{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginTop: "8px" }}>
                        <div>
                            <div style = {{ fontWeight: 700 }}>{shortAddress(this.props.walletAddress)}</div>
                        </div>
                        <div className = "status-pill success"><a href="javascript:;" onClick={() => window.walletModal.open({view:"Account"})}>Manage</a></div>
                    </div>
                </div>
            </div>
        );
    },
    render: function() {
        return (
            <div className = "glass-card card-pad">
                <div className = "card-header">
                    <div>
                        <h2 className = "card-title">Wallet</h2>
                        <div className = "card-copy">Connect your wallet to unlock rewards and liquidity actions.</div>
                    </div>
                </div>
                {this.props.walletAddress ? this.renderConnected() : null}
                {!this.props.walletAddress ? (
                    <div className = "notice-box" style = {{ marginTop: "12px" }}>
                        <div className = "helper-text">Nothing moves until your wallet is connected. This keeps the screen clean and avoids accidental actions.</div>
                    </div>
                ) : null}
            </div>
        );
    }
});
