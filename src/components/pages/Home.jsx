import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import SearchBar from "../SearchBar";
import './Home.css'; // Import the CSS for custom styles

export const Home = () => {
  const [contractTxIds, setContractTxIds] = useState([]);
  const [transactionData, setTransactionData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const navigate = useNavigate();

  const executeGraphQL = async (query) => {
    try {
      const response = await fetch('https://arweave.net/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`Query failed with status code ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      return result.data.transactions.edges;
    } catch (error) {
      console.error("Error executing GraphQL query:", error);
    }
  };

  const fetchNetworkTransactions = async () => {
    const networkTxQuery = `
    {
      transactions(
        tags: [
          { name: "Network", values: ["Perma-Press"] }
        ]
      ) {
        edges {
          node {
            id
            tags {
              name
              value
            }
          }
        }
      }
    }`;

    const networkTransactions = await executeGraphQL(networkTxQuery);
    return networkTransactions;
  };

  const filterContractTxIds = (networkTransactions) => {
    const filteredTxIds = [];
    networkTransactions.forEach(transaction => {
      transaction.node.tags.forEach(tag => {
        if (tag.name === "Contract-Src") {
          filteredTxIds.push(tag.value);
        }
      });
    });
    return filteredTxIds;
  };

  const fetchContractTransactions = async (contractTxId) => {
    const contractTxQuery = `
    {
      transactions(
        tags: [
          { name: "Contract-Src", values: ["${contractTxId}"] }
        ]
      ) {
        edges {
          node {
            id
            block {
              timestamp
            }
            tags {
              name
              value
            }
          }
        }
      }
    }`;

    return await executeGraphQL(contractTxQuery);
  };

  const fetchInitState = async (contractTxIds) => {
    const transactionDetails = [];

    for (const contractTxId of contractTxIds) {
      const transactions = await fetchContractTransactions(contractTxId);
      
      if (transactions.length > 0) {
        const mostRecentTransaction = transactions.reduce((prev, current) => {
          return (prev.node.block.timestamp > current.node.block.timestamp) ? prev : current;
        });

        const oldestTransaction = transactions.reduce((prev, current) => {
          return (prev.node.block.timestamp < current.node.block.timestamp) ? prev : current;
        });

        const initStateTag = mostRecentTransaction.node.tags.find(tag => tag.name === "Init-State");

        if (initStateTag) {
          const initStateData = JSON.parse(initStateTag.value);
          
          const isDuplicate = transactionDetails.some(item => item.contractTxId === contractTxId);

          if (!isDuplicate) {
            transactionDetails.push({
              contractTxId,
              mostRecentTxId: mostRecentTransaction.node.id,
              mostRecentTimestamp: new Date(mostRecentTransaction.node.block.timestamp * 1000).toLocaleString(),
              oldestTxId: oldestTransaction.node.id,
              oldestTimestamp: new Date(oldestTransaction.node.block.timestamp * 1000).toLocaleString(),
              ...initStateData,
            });
          }
        }
      }
    }

    setTransactionData(transactionDetails);
    setFilteredData(transactionDetails); // Set the filtered data initially
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const networkTransactions = await fetchNetworkTransactions();
        const filteredTxIds = filterContractTxIds(networkTransactions);
        setContractTxIds(filteredTxIds);
        await fetchInitState(filteredTxIds);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchData();
  }, []);

  const handlePurchaseClick = (nftData) => {
    navigate('/purchase', { state: nftData });
  };

  const handleSearch = (searchCriteria) => {
    const { fromDate, toDate, minPrice, maxPrice, ownerAddress } = searchCriteria;

    const filtered = transactionData.filter(item => {
      const matchesFromDate = fromDate ? new Date(item.mostRecentTimestamp) >= new Date(fromDate) : true;
      const matchesToDate = toDate ? new Date(item.mostRecentTimestamp) <= new Date(toDate) : true;
      const matchesMinPrice = minPrice ? item.price >= minPrice : true;
      const matchesMaxPrice = maxPrice ? item.price <= maxPrice : true;
      const matchesOwnerAddress = ownerAddress ? item.owner === ownerAddress : true;

      return (
        matchesFromDate &&
        matchesToDate &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesOwnerAddress
      );
    });

    setFilteredData(filtered);
  };

  return (
    <div className="bg-gray-900 text-white p-4">
      <SearchBar onSearch={handleSearch} />
      <h2 className="text-2xl font-bold mb-4">Transaction Data</h2>
      <div className="overflow-x-auto">
        <ul className="space-y-4">
          {filteredData.map(({ contractTxId, mostRecentTxId, mostRecentTimestamp, oldestTxId, oldestTimestamp, owner, title, description, balance, price }) => (
            <li key={contractTxId} className="bg-gray-800 rounded-lg p-4 shadow-lg">
              <img 
                src={`https://arweave.net/${oldestTxId}`} 
                alt={`Oldest Transaction ID: ${oldestTxId}`} 
                className="rounded-md w-full h-auto"
              />
              <div className="mt-2">
                <strong>Contract ID:</strong> {contractTxId}<br />
                <strong>Most Recent Transaction ID:</strong> {mostRecentTxId}<br />
                <strong>Most Recent Timestamp:</strong> {mostRecentTimestamp}<br />
                <strong>Oldest Transaction ID:</strong> {oldestTxId}<br />
                <strong>Oldest Timestamp:</strong> {oldestTimestamp}<br />
                <strong>Owner:</strong> {owner}<br />
                <strong>Title:</strong> {title}<br />
                <strong>Description:</strong> {description}<br />
                <strong>Balance:</strong> {balance}<br />
                <strong>Price:</strong> {price}<br />
                <button 
                  onClick={() => handlePurchaseClick({ contractTxId, price, owner, oldestTxId, title, description })} 
                  className="mt-2 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition"
                >
                  Purchase
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Home;
