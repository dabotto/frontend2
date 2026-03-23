var PositionStatusSynopsis = React.createClass({
    getFixedStopPositions: function() {
        return {
            lowerBound: 8,
            dangerZoneStartLeft: 20,
            leftBound: 33.33,
            positionPrice: 50,
            rightBound: 66.66,
            dangerZoneStartRight: 80,
            upperBound: 92
        };
    },
    getScoreClass: function(score) {
        if (score === 0) {
            return "position-score position-score-green";
        }
        if (score === -1 || score === 1) {
            return "position-score position-score-yellow";
        }
        if (score === -2 || score === 2) {
            return "position-score position-score-orange";
        }
        return "position-score position-score-red";
    },
    shortAddress: function(address) {
        if (!address) {
            return "";
        }
        return address.slice(0, 6) + "..." + address.slice(-4);
    },
    toNumber: function(value) {
        var n = Number(value);
        if (!isFinite(n)) {
            return 0;
        }
        return n;
    },
    formatValue: function(value) {
        var n = this.toNumber(value);
        if (Math.abs(n) >= 1000000) {
            return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
        }
        if (Math.abs(n) >= 1000) {
            return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
        }
        if (Math.abs(n) >= 1) {
            return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
        }
        return n.toLocaleString("en-US", { maximumFractionDigits: 8 });
    },
    getStops: function(item) {
        return [
            { key: "lowerBound", label: "Out", value: this.toNumber(item.prices[0]), kind: "edge" },
            { key: "dangerZoneStartLeft", label: "Danger", value: this.toNumber(item.prices[1]), kind: "danger" },
            { key: "leftBound", label: "Warning", value: this.toNumber(item.prices[2]), kind: "bound" },
            { key: "positionPrice", label: "OK", value: this.toNumber(item.positionPrice), kind: "position" },
            { key: "rightBound", label: "Warning", value: this.toNumber(item.prices[3]), kind: "bound" },
            { key: "dangerZoneStartRight", label: "Danger", value: this.toNumber(item.prices[4]), kind: "danger" },
            { key: "upperBound", label: "Out", value: this.toNumber(item.prices[5]), kind: "edge" }
        ];
    },
    toPercent: function(value, metrics) {
        var n = this.toNumber(value);
        var pct = ((n - metrics.min) / metrics.span) * 100;
        if (pct < 0) {
            return 0;
        }
        if (pct > 100) {
            return 100;
        }
        return pct;
    },
    renderStop: function(stop) {
        var positions = this.getFixedStopPositions();
        var left = positions[stop.key];
        return (
            <div key = {stop.key} className = {"position-stop position-stop-" + stop.kind} style = {{ left: left + "%" }}>
                <div className = "position-stop-line"></div>
                <div className = "position-stop-label">{stop.label}</div>
                <div className = "position-stop-value">{this.formatValue(stop.value)}</div>
            </div>
        );
    },
    getCurrentPricePercent: function(item) {
        var currentPrice = this.toNumber(item.currentPrice);
        var positions = this.getFixedStopPositions();

        var segments = [
            {
                minValue: this.toNumber(item.prices[0]),
                maxValue: this.toNumber(item.prices[1]),
                minPct: positions.lowerBound,
                maxPct: positions.dangerZoneStartLeft
            },
            {
                minValue: this.toNumber(item.prices[1]),
                maxValue: this.toNumber(item.prices[2]),
                minPct: positions.dangerZoneStartLeft,
                maxPct: positions.leftBound
            },
            {
                minValue: this.toNumber(item.prices[2]),
                maxValue: this.toNumber(item.positionPrice),
                minPct: positions.leftBound,
                maxPct: positions.positionPrice
            },
            {
                minValue: this.toNumber(item.positionPrice),
                maxValue: this.toNumber(item.prices[3]),
                minPct: positions.positionPrice,
                maxPct: positions.rightBound
            },
            {
                minValue: this.toNumber(item.prices[3]),
                maxValue: this.toNumber(item.prices[4]),
                minPct: positions.rightBound,
                maxPct: positions.dangerZoneStartRight
            },
            {
                minValue: this.toNumber(item.prices[4]),
                maxValue: this.toNumber(item.prices[5]),
                minPct: positions.dangerZoneStartRight,
                maxPct: positions.upperBound
            }
        ];

        if (currentPrice <= segments[0].minValue) {
            return segments[0].minPct;
        }

        if (currentPrice >= segments[segments.length - 1].maxValue) {
            return segments[segments.length - 1].maxPct;
        }

        for (var i = 0; i < segments.length; i++) {
            var segment = segments[i];

            if (currentPrice >= segment.minValue && currentPrice <= segment.maxValue) {
                if (segment.maxValue === segment.minValue) {
                    return segment.minPct;
                }

                var ratio = (currentPrice - segment.minValue) / (segment.maxValue - segment.minValue);
                return segment.minPct + ((segment.maxPct - segment.minPct) * ratio);
            }
        }

        return positions.positionPrice;
    },
    renderCurrentPrice: function(item) {
        var currentPrice = this.toNumber(item.currentPrice);
        var left = this.getCurrentPricePercent(item);
        return (
            <div className = "position-current-price" style = {{ left: left + "%" }}>
                <div className = "position-current-arrow">
                    <i className = "fa-solid fa-caret-down"></i>
                </div>
                <div className = "position-current-badge">{this.formatValue(currentPrice)}</div>
            </div>
        );
    },
    getScoreLabel: function(score) {
        if (score === 0) return "safe";
        if (Math.abs(score) === 1) return "warning";
        if (Math.abs(score) === 2) return "danger";
        return "unprofitable";
    },
    renderCard: function(item, index) {
        var score = item.statusResult;
        var stops = this.getStops(item);
        return (
            <div key = {item.poolAddress || index} className = "position-synopsis-card glass-card card-pad">
                <div className = "position-synopsis-head">
                    <div className = "position-synopsis-head-left">
                        <a
                            className = "position-address-link"
                            href = {"https://basescan.org/address/" + item.poolAddress}
                            target = "_blank"
                            rel = "noreferrer"
                        >
                            {this.shortAddress(item.poolAddress)}
                            <i className = "fa-solid fa-arrow-up-right-from-square"></i>
                        </a>
                    </div>
                    <div className = "position-synopsis-head-right">
                        <div className = "position-pair-label"><a target="_blank" href={"https://basescan.org/address/" + item.token0}>{item.symbol0}</a>/<a target="_blank" href={"https://basescan.org/address/" + item.token1}>{item.symbol1}</a></div>
                        <div className = {this.getScoreClass(score)}>
                            <span className = "position-score-label">{this.getScoreLabel(score)}</span>
                        </div>
                    </div>
                </div>
                <div className = "position-chart-wrap">
                    <div className = "position-chart-grid"></div>
                    <div className = "position-chart-line"></div>
                    {stops.map(function(stop) {
                        return this.renderStop(stop);
                    }.bind(this))}
                    {this.renderCurrentPrice(item)}
                </div>
            </div>
        );
    },
    render: function() {
        return (
            <div className = "glass-card card-pad">
                <div className = "card-title">Position status</div>
                {!this.props.items && <div className = "card-copy">Loading status of the positions...</div>}
                {this.props.items && this.props.items.length > 0 ? <>
                <div className = "section-divider"></div>
                <button className = "button-base button-primary" disabled={!this.props.rebalance} onClick={this.props.onRebalance}>
                    <i className = "fa-solid fa-scale-unbalanced"></i>
                    Rebalance
                </button>
                <div className="position-synopsis-list" style={{"margin-top" : "5%"}}>
                    {this.props.items.map(this.renderCard)}
                </div> </> : null}
            </div>
        );
    }
});