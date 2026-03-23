var IndexController = function(view) {
    var context = this;
    context.view = view;

    var tickerConverter = {
        "EURC" : "€",
        "USDC" : "$"
    }

    context.refreshBalance = async function refreshBalance() {
        context.refreshBalanceTimeout && clearTimeout(context.refreshBalanceTimeout);
        if(!web3?.currentProvider || !context?.view?.state?.walletAddress || context?.view?.state?.mode === 'none' || !context.view.state[context?.view?.state?.mode + "TokenAddress"]) {
            return context?.view?.setState({balance : null, allowance : null});
        }
        var from = context.view.state.walletAddress;
        var tokenAddress = context.view.state[context.view.state.mode + "TokenAddress"];
        var balance = '0';
        var allowance = '0';
        if(tokenAddress === voidEthereumAddress) {
            allowance = balance = await web3.eth.getBalance(from);
        } else {
            balance = abi.decode(["uint256"], await call(tokenAddress, "balanceOf(address)", from))[0].toString();
            allowance = abi.decode(["uint256"], await call(tokenAddress, "allowance(address,address)", from, context.positionAddress))[0].toString();
        }
        context?.view?.setState({balance, allowance});
        context.refreshBalanceTimeout = setTimeout(context.refreshBalance, 7000);
    }

    context.approveForAddLiquidity = function approveForAddLiquidity(address, value) {
        return prepareAndSendTx((new web3.eth.Contract(window.context.IERC20ABI, address)).methods.approve(context.positionAddress, value), {
            returnReceipt : true,
            throwError : true
        });
    }

    context.addLiquidity = function addLiquidity(address, value) {
        return prepareAndSendTx(context.manager.methods.manage(context.view.state.referenceTokenAddress, 0, [], 0, address, value), {
            returnReceipt : true,
            throwError : true,
            value : address === voidEthereumAddress ? value : "0"
        });
    }

    context.removeLiquidity = function removeLiquidity(address, value, readonly) {
        var method = context.manager.methods.manage(address, value, [], 0, voidEthereumAddress, 0);
        return readonly ? method.call({from : context.view.state.walletAddress}) : prepareAndSendTx(method);
    }

    context.collectFees = function collectFees(address, value, readonly) {
        var method = context.manager.methods.manage(address, 0, context.tokenAddresses, value, voidEthereumAddress, 0);
        return readonly ? method.call({from : context.view.state.walletAddress}) : prepareAndSendTx(method);
    }

    context.rebalance = function rebalance() {
        return prepareAndSendTx(context.manager.methods.rebalance([context.positionAddress], [context.toRebalance]));
    }

    context.claimReward = function claimReward() {
        return prepareAndSendTx(context.manager.methods.claimReward(context.view.state.referenceTokenAddress));
    }

    async function prepareAndSendTx(method, options = {}) {
        context.timeout && clearTimeout(context.timeout);
        var account = context.view.state.walletAddress;
        var tx = {
            from : account
        };
        options.value !== '0' && (tx.value = options.value);
        var gas = await method.estimateGas(tx);
        gas = parseInt(gas) * 1.3;
        gas = parseInt(gas);
        gas = numberToString(gas);
        gas = web3.utils.numberToHex(gas);
        tx = {
            ...tx,
            to: method._parent.options.address,
            data: method.encodeABI(),
            gas,
            gasPrice: await web3.eth.getGasPrice()
        };
        try {
            var receipt = await web3.eth.sendTransaction(tx);
            console.log(receipt);
            await new Promise(ok => setTimeout(ok, 2000));
            if(options.returnReceipt) {
                return receipt;
            } else {
                window.open('https://basescan.org/tx/' + receipt.transactionHash, '_blank');
            }
        } catch(e) {
            console.log(e);
            if(options.throwError) {
                throw e;
            } else {
                alert("Error: " + (e.message || e).toString());
            }
        }
        context.init();
    }

    context.init = async function init() {
        context.timeout && clearTimeout(context.timeout);
        var timeoutLimit = 20000;
        var initRefreshData;
        if(!web3?.currentProvider || !context?.view?.state?.walletAddress || !context?.view?.state?.referenceTokenAddress) {
            return void(context.view.emit('initRefresh', initRefreshData), context.timeout = setTimeout(context.init, timeoutLimit));
        }
        try {
            context.manager = context.manager || new web3.eth.Contract(window.context.ManagerABI, window.context.managerAddress);
            var from = context.view.state.walletAddress;
            context.positionAddress = (await context.manager.methods.dataOf(context.view.state.walletAddress).call()).position;
            context.toRebalance = [];
            var manager = context.manager;
            var rebalanceMinutes = parseInt(15);
            var {oldTimestamp, oldBlockNumber, rebalanceSeconds} = await retrieveOldBlockNumberAndTimestamp(rebalanceMinutes);
            var referenceTokenAddress = context.view.state.referenceTokenAddress;
            var referenceToken = getTokenMetaByAddress(referenceTokenAddress);
            var referenceTokenDecimals = referenceToken.decimals;//abi.decode(["uint8"], await call(referenceTokenAddress, "decimals"))[0];
            var referenceTokenTicker = referenceToken.symbol;//abi.decode(["string"], await call(referenceTokenAddress, "symbol"))[0];
            referenceTokenTicker = (tickerConverter[referenceTokenTicker] || referenceTokenTicker) + " ";

            var historicalData;
            var globalStatus = await manager.methods.statuses([context.positionAddress]).call();
            var data = globalStatus[0];
            try {
                historicalData = await manager.methods.statuses([context.positionAddress]).call(undefined, web3.utils.numberToHex(oldBlockNumber));
                historicalData = historicalData[0];
            } catch(e) {}

            var messages = [];

            var positions = [];

            for(var i in data) {
                var warningZoneTimeout = false;
                if(data[i].result !== '0') {
                    context.toRebalance.push(i);
                }
                if(data[i].result !== '0' && (parseInt(oldTimestamp) - parseInt(data[i].positionTime) >= rebalanceSeconds) && historicalData && historicalData[i].result === data[i].result) {
                    warningZoneTimeout = true;
                }
                var statusResult = parseInt(data[i].result);
                var lowerBound = data[i].lowerBound;
                var upperBound = data[i].upperBound;
                var bounds = [lowerBound, upperBound];
                data[i].currentPrice !== '0' && bounds.push(data[i].currentPrice);
                data[i].positionPrice !== '0' && bounds.push(data[i].positionPrice);
                data[i].leftBound !== '0' && bounds.push(data[i].leftBound);
                data[i].rightBound !== '0' && bounds.push(data[i].rightBound);
                data[i].dangerZoneStartLeft !== '0' && bounds.push(data[i].dangerZoneStartLeft);
                data[i].dangerZoneStartRight !== '0' && bounds.push(data[i].dangerZoneStartRight);
                bounds = bounds.filter(it => it !== '0').filter((it, i, arr) => arr.indexOf(it) === i).sort((a,b) => parseInt(web3.utils.toBN(a).sub(web3.utils.toBN(b))));
                var prices = bounds.map(() => '0');
                try {
                    prices = await sqrtToOutputPrice(manager.options.address, data[i].poolAddress, bounds, referenceTokenAddress);
                } catch(e) {}
                var reverse = parseInt(prices[0]) > parseInt(prices[prices.length - 1]);
                if(reverse) {
                    bounds = bounds.reverse();
                    prices = prices.reverse();
                    statusResult = parseInt(String(-parseInt(statusResult)));
                }
                prices = prices.map(it => parseFloat(fromDecimals(it, referenceTokenDecimals, true)));
                var token0 = abi.decode(["address"], await call(data[i].poolAddress, "token0"))[0];
                var symbol0 = abi.decode(["string"], await call(token0, "symbol"))[0];
                var token1 = abi.decode(["address"], await call(data[i].poolAddress, "token1"))[0];
                var symbol1 = abi.decode(["string"], await call(token1, "symbol"))[0];
                var position = {
                    poolAddress : data[i].poolAddress,
                    token0,
                    symbol0,
                    token1,
                    symbol1,
                    statusResult,
                    prices : []
                };
                var message = "";
                var sqrtPriceX96Message = "";
                var leftBound = "[(";
                var rightBound = ")]";
                for(var z in bounds) {
                    var sqrtPriceX96 = bounds[z = parseInt(z)];
                    var price = prices[z] === '0' ? sqrtPriceX96 : prices[z];
                    message += putSpaceBefore(message);
                    sqrtPriceX96Message += putSpaceBefore(sqrtPriceX96Message);

                    if(sqrtPriceX96 === lowerBound || sqrtPriceX96 === upperBound) {
                        message += price;
                        sqrtPriceX96Message += sqrtPriceX96;
                        position.prices.push(price);
                    } else if(sqrtPriceX96 === data[i].leftBound) {
                        message += ((reverse ? "(" : "") + price + (reverse ? "" : ")"));
                        sqrtPriceX96Message += ((reverse ? "(" : "") + sqrtPriceX96 + (reverse ? "" : ")"));
                        position.prices.push(price);
                    } else if(sqrtPriceX96 === data[i].dangerZoneStartLeft) {
                        message += ((reverse ? "| " : "") + price + (reverse ? "" : " |"));
                        sqrtPriceX96Message += ((reverse ? "| " : "") + sqrtPriceX96 + (reverse ? "" : " |"));
                        position.prices.push(price);
                    } else if(sqrtPriceX96 === data[i].currentPrice) {
                        if(z === bounds.length - 1) {
                            message += (rightBound + " ");
                            sqrtPriceX96Message += (rightBound + " ");
                            rightBound = "";
                        }
                        message += ("-> " + price + " <-");
                        sqrtPriceX96Message += ("-> " + sqrtPriceX96 + " <-");
                        position.currentPrice = price;
                        if(z === 0) {
                            message += (" " + leftBound);
                            sqrtPriceX96Message += (" " + leftBound);
                            leftBound = "";
                        }
                    } else if(sqrtPriceX96 === data[i].positionPrice) {
                        message += ("{" + price + "}");
                        sqrtPriceX96Message += ("{" + sqrtPriceX96 + "}");   
                        position.positionPrice = price;
                    } else if(sqrtPriceX96 === data[i].dangerZoneStartRight) {
                        message += ((reverse ? "" : "| ") + price + (reverse ? " |" : ""));
                        sqrtPriceX96Message += ((reverse ? "" : "| ") + sqrtPriceX96 + (reverse ? " |" : ""));
                        position.prices.push(price);
                    } else if(sqrtPriceX96 === data[i].rightBound) {
                        message += ((reverse ? "" : "(") + price + (reverse ? ")" : ""));
                        sqrtPriceX96Message += ((reverse ? "" : "(") + sqrtPriceX96 + (reverse ? ")" : ""));
                        position.prices.push(price);
                    }
                }
                
                message = leftBound + message + rightBound;
                sqrtPriceX96Message = leftBound + sqrtPriceX96Message + rightBound;
                //console.log(symbol0 + "/" + symbol1, data[i].poolAddress, "Status:", statusResult, "\n\n", message);

                messages.push(`${data[i].poolAddress} ${reverse ? symbol1 : symbol0}/${reverse ? symbol0 : symbol1} Status: ${(statusResult !== 0 ? "<b>" : "") + statusResult + (statusResult !== 0 ? "</b>" : "") + (warningZoneTimeout ? " <b><u>[WARNING ZONE TIMEOUT]</u></b>" : "")}<br/>${message.split('-> ').join('<b>-> ').split(' <-').join(' <-</b>')}`);

                positions.push(position);
            }

            var result = await manager.methods.manage(referenceTokenAddress, numberToString(0), [], numberToString(0), voidEthereumAddress, 0).call({from});
            context.tokenAddresses = [voidEthereumAddress, ...result.poolTokenAddresses].filter((it, i, arr) => arr.indexOf(it) === i);
            result = await manager.methods.manage(referenceTokenAddress, numberToString(1e18), context.tokenAddresses, numberToString(1e18), voidEthereumAddress, 0).call({from});

            var summary = {
                "Your heritage" : referenceTokenTicker + fromDecimals(result.totalRemoved, referenceTokenDecimals),
                "Reward Accrued" : referenceTokenTicker + fromDecimals(result.claimedReward, referenceTokenDecimals),
                "Your P&L" : referenceTokenTicker + fromDecimals(result.profitAndLoss, referenceTokenDecimals)
            };
            var accruedFees = fromDecimals(result.totalCollected, referenceTokenDecimals, true);
            //console.log(summary);
            var summaryString = JSON.stringify(summary, null, 4).split('    ').join('').split('{').join('').split('}').join('').trim().split(' ').join('&nbsp;').split('\n').join('<br/><br/>');
        
            initRefreshData = [accruedFees, summaryString, positions, context.toRebalance.length !== 0];
        } catch(e) {
            console.log(e);
        }
        return void(context.view.emit('initRefresh', initRefreshData), context.timeout = setTimeout(context.init, timeoutLimit));
    };

    async function call(to, method) {
        var args = [];
        for(var i in arguments) {
            if(parseInt(i) < 2) {
                continue;
            }
            args.push(arguments[i]);
        }
        if(method[method.length - 1] !== ')') {
            method += '()';
        }
        var data = web3.utils.sha3(method).substring(0, 10);
        if(method[method.length - 2] !== '(') {
            var argsList = method.split('(')[1];
            argsList = argsList.substring(0, argsList.length - 1);
            argsList = argsList.split(',');
            data += abi.encode(argsList, args).substring(2);
            args = args.splice(argsList.length + 1);
        }
        var callOptions = {
            to,
            data
        };
        args.length != 0 && (callOptions.from = args[args.length - 1]);
        var response = await web3.eth.call(callOptions);
        return response;
    }

    async function sqrtToOutputPrice(to, poolAddress, prices, outputTokenAddress) {
        try {
            var data = (web3.utils.sha3("sqrtToOutputPrice(address,uint160[],address)").substring(0, 10)) + abi.encode(["address", "uint160[]", "address"], [poolAddress, prices, outputTokenAddress]).substring(2);
            data = await web3.eth.call({
                to,
                data
            });
            data = abi.decode(["uint256[]"], data)[0];
            data = [...data].map(it => it.toString());
            return data;
        } catch(e) {
            console.log("PoolAddress", poolAddress, "prices", prices);
            console.trace(e);
            throw e;
        }
    }
    
    function putSpaceBefore(message) {
        return message !== '' && message[message.length - 1] !== ' ' ? " " : "";
    }

    async function retrieveOldBlockNumberAndTimestamp(rebalanceMinutes) {
        var rebalanceSeconds = rebalanceMinutes * 60;
        var blockNumber = await web3.eth.getBlock('latest');
        var actualTimestamp = parseInt(blockNumber.timestamp);
        blockNumber = parseInt(blockNumber.number);
        var times = 30;
        var oldBlockNumber;
        var oldTimestamp;
        while(true) {
            var oldBlockNumber = await web3.eth.getBlock(blockNumber - times);
            var oldTimestamp = parseInt(oldBlockNumber.timestamp);
            oldBlockNumber = parseInt(oldBlockNumber.number);
            var timestampDifference = actualTimestamp - oldTimestamp;
            if(timestampDifference >= rebalanceSeconds) {
                break;
            }
            times += parseInt(rebalanceSeconds / (timestampDifference / (blockNumber - oldBlockNumber)));
        }
        return {oldBlockNumber, oldTimestamp, rebalanceSeconds};
    }

    function timeRemaining(targetDate) {
        var diff = targetDate.getTime() - new Date().getTime();
        if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };
        var minutes = Math.floor(diff / 60000);
        var days = Math.floor(minutes / 1440);
        minutes -= days * 1440;
        var hours = Math.floor(minutes / 60);
        minutes -= hours * 60;
        return { targetDate, days, hours, minutes };
    }

    function dateInfo(d){
        var sevenDaysBefore = new Date(d.getTime() - 7 * 24 * 60 * 60 * 1000);
        var now = new Date();
        var daysPassed = (now.getTime() - sevenDaysBefore.getTime()) / (24 * 60 * 60 * 1000);
        return {
            original : d,
            sevenDaysBefore : sevenDaysBefore,
            daysPassed : daysPassed
        };
    }

    function formatDate(dateInput) {
        var days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
        var dd = String(dateInput.getDate()).padStart(2,"0");
        var mm = String(dateInput.getMonth() + 1).padStart(2,"0");
        var yyyy = dateInput.getFullYear();
        var hh = String(dateInput.getHours()).padStart(2,"0");
        var min = String(dateInput.getMinutes()).padStart(2,"0");
        return days[dateInput.getDay()] + ", " + dd + "/" + mm + "/" + yyyy + " " + hh + ":" + min;
    }

    function weeksToEndOfYear(d){
        var shifted = new Date(d.getTime() - 7 * 24 * 60 * 60 * 1000);
        var endOfYear = new Date(shifted.getFullYear(), 11, 31, 23, 59, 59, 999);
        var weeksRemaining = Math.ceil((endOfYear.getTime() - shifted.getTime()) / (7 * 24 * 60 * 60 * 1000));
        return {original : d, shiftedDate : shifted, weeksRemaining : weeksRemaining};
    }

    var wasHidden;
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleVisibility);

    function handleVisibility() {
        if(document.visibilityState === 'hidden' && !wasHidden) {
            return wasHidden = true;
        }
        if(document.visibilityState === 'visible' && wasHidden) {
            wasHidden = false;
            context.init();
        }
    }
};