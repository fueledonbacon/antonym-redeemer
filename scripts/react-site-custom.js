
class Todo extends React.Component {

    constructor() {
        super();
        this.state = {
            address: null,
            ethersjs: null,
            signer: null,
            connected: false,
            error: null,
            networkId: 4,
            materia: "0x57966f291eb9Aa4095cBa71Ba9e3f5A04EBAda4F",
            contract: null,
            materiaTokenId: null,
            primaTokenId: null
        };
    }

    async componentDidMount() {
        await this.checkMetamaskInstalled()
    }

    async checkMetamaskInstalled() {
        const { ethereum, web3 } = window
        const { networkId } = this.state;
        if (ethereum) {
            const ethersjs = new ethers.providers.Web3Provider(ethereum)
            const netId = (await ethersjs.getNetwork()).chainId
            if(netId !== networkId) return this.setState({error: `Select ${getNetwork(netId)}`})
            this.setState({ ethersjs  })
        } else if (web3) {
            const ethersjs = ethers.providers.Web3Provider(web3.currentProvider)
            const netId = (await ethersjs.getNetwork()).chainId
            if(netId !== networkId) return this.setState({error: `Select ${getNetwork(netId)}`})
            this.setState({ ethersjs })
        } else {
            this.setState({ error: "Web3 provider not installed" })
        }
    }

    async onConnect() {
        try {
            const enableMetamask = await this.enableWeb3()
            if (enableMetamask) {
                const address = (await this.state.ethersjs.getSigner().getAddress()).toLowerCase()
                this.setState({ address })
                this.initApp()
            } else {
                return this.setState({ error: "Please enable Metamask" })
            }
        } catch (error) {
            this.setState({ error: this.readError(error) })
        }
    }

    readError(error) {
        try {
            let message = error.message.split('\n')[0]
            try {
                message = error.message.split('(error=')[1].split(', method')[0]
                const metamaskError = JSON.parse(message)
                return (
                    metamaskError.message.charAt(0).toUpperCase() +
                    metamaskError.message.slice(1)
                )
            } catch (e) {
                return message
            }
        } catch (e) {
            return error.message
        }
    }

    async enableWeb3() {
        const { ethereum, location } = window
        try {
            await ethereum.request({ method: 'eth_requestAccounts' })

            // Subscriptions register
            ethereum.on('accountsChanged', async (accounts) => {
                location.reload()
            })

            ethereum.on('networkChanged', async (network) => {
                location.reload()
            })

            return true
        } catch (error) {
            // The user denied account access
            return false
        }
    }

    async initApp() {
        const { materia, ethersjs} = this.state
        const contract = new ethers.Contract(
            materia,
            getAbi(),
            await ethersjs.getSigner()
        );
        this.setState({contract})
    }

    mintMateria() {
        const { materiaTokenId } = this.state;
        if(!materiaTokenId) return
        console.log(materiaTokenId)
    }

    mintPrimaMateria() {
        const { primaTokenId } = this.state;
        if(!primaTokenId) return
        console.log(primaTokenId)
    }

    render() {
        const { error, address, contract } = this.state;
        if (error) {
            return <div>{error}</div>
        }
        if (address === null) {
            return <button onClick={() => this.onConnect()}>Connect</button>
        } else {
            if(contract) {
                return (
                    <div>
                        <div>{address}</div>
                        <div>
                            <div><h3>Mint Materia</h3></div>
                            <input onChange={({target})=>this.setState({materiaTokenId: target.value})}></input>
                            <button onClick={()=>this.mintMateria()}>Mint</button>
                            <br/>
                            <div><h3>Mint Prima Materia</h3></div>
                            <input onChange={({target})=>this.setState({primaTokenId: target.value})}></input>
                            <button onClick={()=>this.mintPrimaMateria()}>Mint</button>
                        </div>
                    </div>
                )
            } else return <div>Unable to load contract</div>
        }
    }
};


ReactDOM.render(<Todo />, document.getElementById('app'));

function getNetwork(id) {
    if(id === 4) return "Mainnet"
    else return "Rinkeby"
}

function getAbi() {
    return [
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "antonymTokenId",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            }
          ],
          "name": "mintMateria",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "antonymTokenId",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            },
            {
              "internalType": "bytes32[]",
              "name": "proof",
              "type": "bytes32[]"
            }
          ],
          "name": "mintPrimaMateria",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ]
}