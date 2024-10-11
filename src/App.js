import React, { useState } from 'react';
import Web3 from 'web3'; // web3.js를 가져옵니다.
import detectEthereumProvider from '@metamask/detect-provider';

function App() {
  const [account, setAccount] = useState(null);
  const [calldata, setCalldata] = useState('');
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
  const [resultMessage, setResultMessage] = useState(''); // 결과 메시지 상태 추가
  const [sbtContractAddress, setSbtContractAddress] = useState('');
  const [sbtContractABI, setSbtContractABI] = useState('');

  // 고정된 Contract Address와 ABI
  const fixedContractAddress = '0xAb28F873CBb424BF2A6412Cad3d32b9581F4a57d';
  const fixedContractABI = [
    {
      "inputs": [
        {
          "internalType": "uint256[2]",
          "name": "_pA",
          "type": "uint256[2]"
        },
        {
          "internalType": "uint256[2][2]",
          "name": "_pB",
          "type": "uint256[2][2]"
        },
        {
          "internalType": "uint256[2]",
          "name": "_pC",
          "type": "uint256[2]"
        },
        {
          "internalType": "uint256[5]",
          "name": "_pubSignals",
          "type": "uint256[5]"
        }
      ],
      "name": "verifyProof",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  // 고정된 SBT 발급 컨트랙트 주소와 ABI
  const fixedSbtContractAddress = '0x9a810c5603338e49fF033204778f90665B7324f8';
  const fixedSbtContractABI = [
    {
      "inputs": [
        {
          "internalType": "uint256[2]",
          "name": "_pA",
          "type": "uint256[2]"
        },
        {
          "internalType": "uint256[2][2]",
          "name": "_pB",
          "type": "uint256[2][2]"
        },
        {
          "internalType": "uint256[2]",
          "name": "_pC",
          "type": "uint256[2]"
        },
        {
          "internalType": "uint256[5]",
          "name": "_pubSignals",
          "type": "uint256[5]"
        },
        {
          "internalType": "string",
          "name": "tokenURI",
          "type": "string"
        }
      ],
      "name": "mintNFT",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
    // ... 필요한 다른 ABI 항목들 ...
  ];

  // MetaMask 연결 함수
  const connectMetaMask = async () => {
    const provider = await detectEthereumProvider();
    if (provider) {
      try {
        // Holesky 네트워크 정보로 업데이트
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x4268', // 17000의 16진수 표현
            chainName: 'Holesky',
            nativeCurrency: {
              name: 'Holesky Ether',
              symbol: 'ETH',
              decimals: 18
            },
            rpcUrls: ['https://rpc.holesky.ethpandaops.io'], // 정확한 RPC URL
            blockExplorerUrls: [] // 블록 탐색기 URL이 필요하면 추가
          }]
        });

        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        setIsMetaMaskConnected(true);
        console.log('MetaMask connected:', accounts[0]);
      } catch (error) {
        console.error('MetaMask connection failed:', error);
      }
    } else {
      alert('MetaMask가 설치되어 있지 않습니다.');
    }
  };

  // SBT 발급 함수
  const issueSBT = async () => {
    if (!calldata) {
      alert('Calldata를 입력하세요.');
      return;
    }

    try {
      const web3 = new Web3(window.ethereum); // Web3 인스턴스 생성
      await window.ethereum.request({ method: 'eth_requestAccounts' }); // MetaMask 계정 요청
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      console.log('Account:', account);

      const contract = new web3.eth.Contract(fixedContractABI, fixedContractAddress);
      console.log('Contract:', contract);

      // Calldata를 JSON 형식으로 변환
      const formattedCalldata = `[${calldata.replace(/0x[0-9a-fA-F]+/g, match => `"${match}"`).replace(/\[/g, '[').replace(/\]/g, ']').replace(/,/g, ',')}]`;
      const parsedCalldata = JSON.parse(formattedCalldata);
      console.log('Parsed Calldata:', parsedCalldata);

      // verifyProof 함수에 전달할 파라미터 분리
      const [pA, pB, pC, pubSignals] = parsedCalldata;

      console.log('pA:', pA, 'pB:', pB, 'pC:', pC, 'pubSignals:', pubSignals);

      // call을 사용하여 view 함수 호출
      const result = await contract.methods.verifyProof(pA, pB, pC, pubSignals).call();
      console.log('View 함수 결과:', result);

      setResultMessage(result ? '성공' : '실패'); // 결과 메시지 업데이트
      // alert('View 함수 결과: ' + result); // alert 제거
    } catch (error) {
      console.error('자격 검증 실패:', error);
      alert('자격 검증 실패. 콘솔에서 오류를 확인하세요.');
    }
  };

  // SBT 발급 버튼 클릭 시 호출되는 함수
  const handleIssueSBT = async () => {
    if (!calldata) {
      alert('Calldata를 입력하세요.');
      return;
    }

    try {
      const web3 = new Web3(window.ethereum); // Web3 인스턴스 생성
      await window.ethereum.request({ method: 'eth_requestAccounts' }); // MetaMask 계정 요청
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      console.log('Account:', account);

      const contract = new web3.eth.Contract(fixedSbtContractABI, fixedSbtContractAddress);
      console.log('SBT Contract:', contract);

      // Calldata를 JSON 형식으로 변환
      const formattedCalldata = `[${calldata.replace(/0x[0-9a-fA-F]+/g, match => `"${match}"`).replace(/\[/g, '[').replace(/\]/g, ']').replace(/,/g, ',')}, "https://maroon-genuine-guineafowl-789.mypinata.cloud/ipfs/Qmaf4s6NsJ3GUeQ6U6sgyvkTKdkp4YNMDrkQigeWE3F1cQ"]`;
      const parsedCalldata = JSON.parse(formattedCalldata);
      console.log('Parsed Calldata:', parsedCalldata);

      // mintNFT 함수에 전달할 파라미터 분리
      const [pA, pB, pC, pubSignals, tokenURI] = parsedCalldata;

      console.log('pA:', pA, 'pB:', pB, 'pC:', pC, 'pubSignals:', pubSignals, 'tokenURI:', tokenURI);

      // mintNFT 함수 호출
      await contract.methods.mintNFT(pA, pB, pC, pubSignals, tokenURI).send({ from: account });
      console.log('NFT 발급 성공');
      alert('NFT 발급 성공');
    } catch (error) {
      console.error('NFT 발급 실패:', error);
      alert('NFT 발급 실패. 콘솔에서 오류를 확인하세요.');
    }
  };

  return (
    <div className="App" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>자격 검증 테스트 페이지</h1>

      {!isMetaMaskConnected ? (
        <button 
          onClick={connectMetaMask} 
          style={{ 
            display: 'block', 
            margin: '20px auto', 
            padding: '10px 20px', 
            fontSize: '16px', 
            cursor: 'pointer' 
          }}
        >
          MetaMask 연결
        </button>
      ) : (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <p>연결된 MetaMask 계정: <strong>{account}</strong></p>
        </div>
      )}

      <form style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '15px' }}>
          <label>Calldata:</label>
          <textarea
            value={calldata}
            onChange={(e) => setCalldata(e.target.value)}
            rows="5"
            cols="50"
            placeholder="Comma-separated calldata"
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Contract Address:</label>
          <input
            type="text"
            value={fixedContractAddress}
            readOnly
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', backgroundColor: '#f0f0f0' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Contract ABI:</label>
          <textarea
            value={JSON.stringify(fixedContractABI, null, 2)}
            readOnly
            rows="10"
            cols="50"
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', backgroundColor: '#f0f0f0' }}
          />
        </div>

        <button type="button" onClick={issueSBT}>
          자격 검증
        </button>
        <span style={{ marginLeft: '10px', color: resultMessage === '성공' ? 'green' : 'red' }}>
          {resultMessage}
        </span>

        {/* SBT 발급 컨트랙트 정보 입력 폼 */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label>SBT 발급 컨트랙트 Address:</label>
            <input
              type="text"
              value={fixedSbtContractAddress}
              readOnly
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box', backgroundColor: '#f0f0f0' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>SBT 발급 컨트랙트 ABI:</label>
            <textarea
              value={JSON.stringify(fixedSbtContractABI, null, 2)}
              readOnly
              rows="10"
              cols="50"
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box', backgroundColor: '#f0f0f0' }}
            />
          </div>

          <button type="button" onClick={handleIssueSBT}>
            SBT 발급
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;