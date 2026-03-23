var CollectFeesCard = React.createClass({
    render: function() {
        var token = this.props.token;
        var percent = this.props.percent;
        var accruedFees = this.props.accruedFees;
        var totalCollecting = this.props.totalCollecting;
        totalCollecting = !totalCollecting ? 'Loading...' : totalCollecting === '0' ? '--' : (fromDecimals(totalCollecting, token.decimals, true) + token.symbol)
        var totalReinvesting = this.props.totalReinvesting;
        totalReinvesting = !totalReinvesting ? 'Loading...' : totalReinvesting === '0' ? '--' : (fromDecimals(totalReinvesting, token.decimals, true) + token.symbol)
        return (
            <div className = "glass-card card-pad">
                <div className = "card-header">
                    <div>
                        <h2 className = "card-title">Choose the token you want to be rewarded back</h2>
                        <div className = "card-copy">You can change it at any time.</div>
                    </div>
                </div>
                <button className = "select-token-button" onClick = {function() { this.props.onOpenPicker("claimReward"); }.bind(this)}>
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
                                    <div className = "token-name">Select reward token</div>
                                    <div className = "token-subline">Choose the token you want to inspect</div>
                                </div>
                            </div>
                            <i className = "fa-solid fa-chevron-down"></i>
                        </>
                    )}
                </button>
                <div className = "metric-card">
                    <div className = "metric-label notepad-text" ref={ref => ref && (ref.innerHTML = (this.props.summary || "Loading..."))}></div>
                </div>
                <div className = "metric-card">
                    <div className = "metric-label">Fees accrued</div>
                    <div className = "big-value">{accruedFees ? accruedFees + " " + token.symbol : "--"}</div>
                    <div className = "big-subline">{accruedFees ? "You can collect a part to your wallet and reinvest the rest." : "Choose a token to see the current amount."}</div>
                </div>
                <br/>
                <div className = "balance-box">
                    <div className = "slider-wrap">
                        <div className = "slider-head">
                            <div>
                                <div className = "field-label">Collect</div>
                                <div className = "muted">Move the slider until the value feels right.</div>
                            </div>
                            <div className = "percent-value">{percent}%</div>
                        </div>
                        <input
                            type = "range"
                            min = "0"
                            max = "100"
                            step = "1"
                            value = {percent}
                            style = {{ "--slider-fill": percent + "%" }}
                            onChange = {e => this.props.onCollectFees(this.props.token.address, parseFloat(e.target.value, 10) || 0, true)}
                        />
                        <div className = "slider-ticks">
                            <span>0%</span>
                            <span>25%</span>
                            <span>50%</span>
                            <span>75%</span>
                            <span>100%</span>
                        </div>
                    </div>
                </div>
                <div style={{'margin-top' : "5%"}} className = "receive-box">
                    <div className = "field-label">You will receive</div>
                    <div className = "kpi-value" style = {{ marginTop: "8px" }}>{totalCollecting}</div>
                </div>
                <div style={{'margin-top' : "5%"}} className = "receive-box">
                    <div className = "field-label">You will reinvest</div>
                    <div className = "kpi-value" style = {{ marginTop: "8px" }}>{totalReinvesting}</div>
                </div>
                <div className = "section-divider"></div>
                <button className = "button-base button-primary" disabled={!token || !accruedFees || !this.props.totalCollecting || !this.props.totalReinvesting} onClick={() => this.props.onCollectFees(token.address, percent)}>
                    <i className = "fa-solid fa-hand-holding-dollar"></i>
                    {token ? "Perform action" : "Select a token first"}
                </button>
            </div>
        );
    }
});
