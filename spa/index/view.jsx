var Index = React.createClass({
    requiredScripts: [
        "spa/components/Disclaimer.jsx",
        "spa/components/WalletCard.jsx",
        "spa/components/CollectFeesCard.jsx",
        "spa/components/ModeSelector.jsx",
        "spa/components/AddLiquidityCard.jsx",
        "spa/components/RemoveLiquidityCard.jsx",
        "spa/components/TokenPickerModal.jsx",
        "spa/components/PositionStatusSynopsis.jsx"
    ],
    getDefaultSubscriptions() {
        return {
            'initRefresh' : this.initRefresh
        }
    },
    getInitialState: function() {
        return {
            disclaimer : sessionStorage.disclaimer === 'true',
            walletAddress: "",
            mode: "none",
            referenceTokenAddress: localStorage.referenceTokenAddress || "",
            addLiquidityTokenAddress: localStorage.addLiquidityTokenAddress || "",
            approvedTokens: {
            },
            tokenPickerOpen: false,
            tokenPickerContext: "claimReward",
            tokenCacheVersion: 0,
            toast: "",
            balance : null,
            collectPercent : 30,
            removePercent : 0,
            positions : []
        };
    },
    bumpTokenCache: function() {
        this.setState({ tokenCacheVersion: Date.now() });
    },
    onWallet: function(walletAddress) {
        var self = this;
        self.setState({
            walletAddress
        }, walletAddress && ensureDefaultTokenCache(function() {
            self.bumpTokenCache();
            self.controller.init();
        }));
    },
    openTokenPicker: function(context) {
        this.setState({
            tokenPickerOpen: true,
            tokenPickerContext: context
        });
    },
    closeTokenPicker: function() {
        this.setState({ tokenPickerOpen: false });
    },
    handleTokenSelected: function(address) {
        var next = { tokenPickerOpen: false };
        var key = (this.state.tokenPickerContext === 'addLiquidity' ? 'addLiquidity' : 'reference') + "TokenAddress";
        localStorage.setItem(key, next[key] = address);
        this.state.tokenPickerContext !== 'claimReward' && (next.initRefreshData = null);
        this.setState(next, this.state.tokenPickerContext !== 'addLiquidity' ? this.controller.init : this.controller.refreshBalance);
    },
    handleCustomTokensChanged: function() {
        this.bumpTokenCache();
    },
    approveToken(address, value) {
        var self = this;
        address = web3util.utils.toChecksumAddress(address);
        var toast;
        var next = Object.assign({}, this.state.approvedTokens);
        this.controller.approveForAddLiquidity(address, value)
        .then(() => {
            toast = "Approval ready. You can add liquidity now.";
            next[address] = true;
        })
        .catch(e => toast = e.message)
        .finally(() => {        
            self.setState({ approvedTokens: next, toast });
            setTimeout(function() {
                self.setState({ toast: "" });
            }, 2200);
        });
    },
    addLiquidity(address, value) {
        var self = this;
        address = web3util.utils.toChecksumAddress(address);
        var toast;
        var next = Object.assign({}, this.state.approvedTokens);
        this.controller.addLiquidity(address, value)
        .then(() => {
            toast = "Your farming position has been increased.";
            next[address] = false;
        })
        .catch(e => toast = e.message)
        .finally(() => {        
            self.setState({ approvedTokens: next, toast });
            setTimeout(function() {
                self.setState({ toast: "" });
            }, 2200);
        });
    },
    removeLiquidity : function(address, value, readonly) {
        var self = this;
        var percent = toDecimals(value/100, 18);
        this.setState({amountToBeRemoved : readonly ? null : this.state.amountToBeRemoved, removePercent : value}, function() {
            self.removeLiquidityTimeout && clearTimeout(self.removeLiquidityTimeout);
            self.removeLiquidityTimeout = setTimeout(() => self.controller.removeLiquidity(address, percent, readonly).then(result => {
                readonly && this.setState({amountToBeRemoved : result.totalRemoved});
            }), readonly ? 700 : 0);
        });
    },
    collectFees : function(address, value, readonly) {
        var self = this;
        var percent = toDecimals(value/100, 18);
        this.setState({totalCollecting : readonly ? null : this.state.totalCollecting, totalReinvesting : readonly ? null : this.state.totalReinvesting, collectPercent : value}, function() {
            self.collectFeesTimeout && clearTimeout(self.collectFeesTimeout);
            self.collectFeesTimeout = setTimeout(() => self.controller.collectFees(address, percent, readonly).then(result => {
                readonly && this.setState({totalCollecting : result.totalCollected, totalReinvesting : result.totalReinvested});
            }), readonly ? 700 : 0);
        });
    },
    setMode: function(mode) {
        this.setState({ mode: mode, balance : null }, this.controller.refreshBalance);
    },
    initRefresh(result) {
        if(!result) {
            return this.setState({initRefreshData : null});
        }
        var [accruedFees, summary, positions, rebalance] = result;
        var self = this;
        this.setState({
            initRefreshData : {
                accruedFees,
                summary,
                positions,
                rebalance
            }
        }, () => {
            self.collectFees(self.state.referenceTokenAddress, self.state.collectPercent, true);
            self.removeLiquidity(self.state.referenceTokenAddress, self.state.removePercent, true);
        });
    },
    onDisclaimerDismiss() {
        this.setState({disclaimer : true}, () => window.sessionStorage.setItem('disclaimer', 'true'));
    },
    render: function() {

        var referenceToken = getTokenMetaByAddress(this.state.referenceTokenAddress);
        var addToken = getTokenMetaByAddress(this.state.addLiquidityTokenAddress);

        return (
            <div className = "dashboard-shell">
                <div className = "app-stack">
                    {!this.state.disclaimer ? <Disclaimer onDismiss={this.onDisclaimerDismiss}/> : null}
                    {this.state.disclaimer ? <>
                        <WalletCard
                            walletAddress = {this.state.walletAddress}
                            onWallet = {this.onWallet}
                        />
                        {this.state.walletAddress ? (<>
                            <CollectFeesCard
                                token = {referenceToken}
                                accruedFees = {this.state.initRefreshData?.accruedFees}
                                totalCollecting = {this.state.totalCollecting}
                                totalReinvesting = {this.state.totalReinvesting}
                                summary = {this.state.initRefreshData?.summary}
                                onOpenPicker = {this.openTokenPicker}
                                onCollectFees = {this.collectFees}
                                percent = {this.state.collectPercent}
                            />
                            <PositionStatusSynopsis 
                                items={this.state.initRefreshData?.positions}
                                rebalance={this.state.initRefreshData?.rebalance}
                                onRebalance={this.controller.rebalance}
                            />
                            {referenceToken ? <div className = "glass-card card-pad">
                                <div className = "card-header">
                                    <div>
                                        <h2 className = "card-title">Manage your position</h2>
                                        <div className = "card-copy">Add more liquidity through your favorite token or decrease your position.</div>
                                    </div>
                                </div>
                                <ModeSelector mode = {this.state.mode} onChange = {this.setMode} />
                                {this.state.mode === "addLiquidity" ? (
                                    <AddLiquidityCard
                                        token = {addToken}
                                        balance = {this.state.balance}
                                        allowance = {this.state.allowance}
                                        approvedTokens = {this.state.approvedTokens}
                                        onOpenPicker = {this.openTokenPicker}
                                        onApprove = {this.approveToken}
                                        toast = {this.state.toast}
                                        onAddLiquidity = {this.addLiquidity}
                                    />
                                ) : null}
                                {this.state.mode === "removeLiquidity" ? (
                                    <RemoveLiquidityCard 
                                        token={referenceToken} 
                                        amountToBeRemoved = {this.state.amountToBeRemoved}
                                        onOpenPicker = {this.openTokenPicker}
                                        onRemoveLiquidity = {this.removeLiquidity}
                                        percent = {this.state.removePercent}
                                    />
                                ) : null}
                            </div> : null}
                        </>) : null}
                        <div className = "footer-note">{"\u00a0"}</div>
                    </> : null}
                </div>
                {this.state.tokenPickerOpen ? (
                    <TokenPickerModal
                        selectedAddress = {this.state[(this.state.tokenPickerContext === 'addLiquidity' ? 'addLiquidity' : 'reference') + "TokenAddress"]}
                        onClose = {this.closeTokenPicker}
                        onSelect = {this.handleTokenSelected}
                        onTokensChanged = {this.handleCustomTokensChanged}
                    />
                ) : null}
            </div>
        );
    }
});