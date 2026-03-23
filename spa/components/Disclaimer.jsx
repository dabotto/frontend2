var Disclaimer = React.createClass({
    getInitialState() {
        return {
            more : false
        }
    },
    renderMore() {
        return(<>
            <h2>Comprehensive Experimental Software Disclaimer &amp; Limitation of Liability</h2>
            <p><strong>Last updated:</strong> March, 18th, 2026</p>

            <p>
                This application, including its user interface, scripts, smart-contract integrations, transaction facilitation logic,
                token interaction modules, RPC connectivity mechanisms, reward calculation displays, liquidity management tools,
                and any associated documentation or visual outputs (collectively, the “Software”), is provided exclusively as part
                of an <strong>ongoing experimental research and development project</strong>.
            </p>

            <p>
                The Software is not intended to constitute a finished product, financial service, regulated investment interface,
                custodial solution, brokerage system, or professional advisory tool of any kind.
            </p>

            <p>
                By accessing, connecting a wallet to, interacting with, or otherwise using the Software, you expressly acknowledge,
                represent, and agree to the following:
            </p>

            <h3>1. Experimental and Unstable Nature</h3>
            <p>
                The Software is <strong>highly experimental, unaudited, subject to material defects, and under continuous modification</strong>.
                Features, design logic, economic assumptions, transaction flows, integrations, and security properties may change,
                degrade, malfunction, or be permanently discontinued <strong>at any time and without prior notice</strong>.
            </p>
            <p>No assurance is given that:</p>
            <ul>
                <li>the Software will function correctly or consistently;</li>
                <li>displayed balances, rewards, token values, or liquidity metrics will be accurate;</li>
                <li>transactions initiated through the interface will behave as visually represented;</li>
                <li>integrations with smart contracts will remain compatible or safe.</li>
            </ul>

            <h3>2. Blockchain and Smart-Contract Risk Acknowledgment</h3>
            <p>
                You understand that interactions facilitated by the Software involve <strong>permissionless decentralized blockchain protocols</strong>
                which are inherently unpredictable and irreversible.
            </p>
            <p>Such interactions may expose you to, without limitation:</p>
            <ul>
                <li>permanent and unrecoverable loss of digital assets;</li>
                <li>smart-contract exploits or economic design failures;</li>
                <li>malicious token implementations;</li>
                <li>approval misuse or unintended asset transfers;</li>
                <li>liquidity pool insolvency or extreme market volatility;</li>
                <li>miner / validator front-running or transaction reordering;</li>
                <li>protocol governance changes affecting asset value or accessibility.</li>
            </ul>
            <p>
                All blockchain transactions are executed <strong>entirely at your own initiative and risk</strong>.
            </p>

            <h3>3. Third-Party Infrastructure Dependency</h3>
            <p>
                The Software relies on external systems beyond the control of its creators, including but not limited to:
            </p>
            <ul>
                <li>RPC nodes and infrastructure providers;</li>
                <li>wallet software and browser-injected providers;</li>
                <li>network validators and block producers;</li>
                <li>token metadata sources and indexing services;</li>
                <li>decentralized liquidity protocols.</li>
            </ul>
            <p>
                Failures, delays, manipulation, outages, data inconsistencies, or security incidents affecting any such systems may result in
                <strong>financial loss, inability to transact, inaccurate UI outputs, or degraded functionality</strong>.
            </p>

            <h3>4. No Financial, Legal, or Technical Advice</h3>
            <p>Nothing presented through the Software constitutes:</p>
            <ul>
                <li>financial advice;</li>
                <li>investment solicitation;</li>
                <li>portfolio recommendation;</li>
                <li>legal or tax guidance;</li>
                <li>technical assurance of protocol safety.</li>
            </ul>
            <p>
                You remain solely responsible for performing <strong>independent due diligence</strong> regarding all digital asset interactions.
            </p>
            <p>
                No fiduciary duty, agency relationship, partnership, or advisory obligation is created by your use of the Software.
            </p>

            <h3>5. Disclaimer of Warranties</h3>
            <p>
                To the fullest extent permitted by applicable law, the Software is provided <strong>“AS IS”, “WITH ALL FAULTS”, and “AS AVAILABLE”</strong>,
                without any representation or warranty of any kind, whether express, implied, statutory, or otherwise, including but not limited to:
            </p>
            <ul>
                <li>merchantability;</li>
                <li>fitness for a particular purpose;</li>
                <li>uninterrupted operation;</li>
                <li>data accuracy;</li>
                <li>security against exploits;</li>
                <li>compatibility with any wallet, network, or asset.</li>
            </ul>
            <p>
                You assume the entire risk arising out of the use or performance of the Software.
            </p>

            <h3>6. Limitation and Exclusion of Liability</h3>
            <p>
                To the maximum extent permitted by law, under no circumstances shall the creators, developers, designers, contributors,
                maintainers, infrastructure operators, hosting providers, or any related persons or entities be liable for any:
            </p>
            <ul>
                <li>loss of digital assets, tokens, rewards, or liquidity;</li>
                <li>loss of profits, yield, revenue, or anticipated economic benefit;</li>
                <li>loss of data, wallet access, or private credentials;</li>
                <li>indirect, incidental, consequential, special, punitive, or exemplary damages;</li>
                <li>damages arising from protocol exploits, economic attacks, or governance decisions;</li>
                <li>transaction failures, reverts, delays, or unfavorable execution outcomes.</li>
            </ul>
            <p>
                This limitation applies <strong>regardless of the legal theory asserted</strong>, including contract, tort, negligence,
                strict liability, or otherwise, and even if the possibility of such damages was foreseeable.
            </p>

            <h3>7. No Compensation, Refund, or Indemnification</h3>
            <p>
                You expressly agree that <strong>no compensation, reimbursement, refund, or indemnification</strong> shall be owed by the creators
                or contributors for any losses or damages arising from:
            </p>
            <ul>
                <li>software malfunction;</li>
                <li>user interface inaccuracies;</li>
                <li>infrastructure failures;</li>
                <li>third-party integrations;</li>
                <li>blockchain protocol risks;</li>
                <li>market conditions or token volatility.</li>
            </ul>
            <p>
                All losses remain <strong>exclusively your responsibility</strong>.
            </p>

            <h3>8. User Assumption of Total Risk</h3>
            <p>
                By continuing to use the Software, you irrevocably confirm that you:
            </p>
            <ul>
                <li>fully understand the experimental and high-risk nature of decentralized finance;</li>
                <li>voluntarily assume all technological, financial, and regulatory risks;</li>
                <li>accept that losses may be <strong>total, permanent, and unrecoverable</strong>;</li>
                <li>waive any present or future claim against the creators related to such losses.</li>
            </ul>
            <p>
                If you do not agree with these terms, you must <strong>immediately cease all use of the Software</strong>.
            </p>
        </>);
    },
    renderLess() {
        return (<>
            <h2 className = "card-title">Experimental Risk Notice</h2>
            <p>
                This application is <strong>highly experimental</strong> and provided for research and testing purposes only.
                Blockchain interactions are <strong>irreversible</strong> and may result in <strong>partial or total loss of funds</strong>
                {'\u00a0'}due to software bugs, smart-contract risks, network failures, or inaccurate interface data.
            </p>
            <p>
                The software is provided <strong>"as-is"</strong> with no warranties.
                By using it, you agree that you do so <strong>entirely at your own risk</strong>, and that the creators
                <strong>bear no liability and will provide no compensation</strong> for any losses or damages.
            </p>
        </>);
    },
    render() {
        return (
            <div className = "glass-card card-pad">
                <div className = "card-header">
                    <div>
                        {this["render" + (this.state.more ? "More" : "Less")]()}
                        <p>
                            <a href="javascript:;" onClick={() => this.setState({more : !this.state.more})}>{this.state.more ? "Show less" : "Read more"}</a>
                        </p>
                    </div>
                </div>
                <div className = "section-divider"></div>
                <button className = "button-base button-primary" onClick={this.props.onDismiss}>
                    <i className = "fa-solid fa-check"></i>
                    I've read and accept the conditions
                </button>
            </div>
        );
    }
});