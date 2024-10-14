import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import SearchBar from "../SearchBar";

export const Home = () => {
  const [contractTxIds, setContractTxIds] = useState([]);
  const [transactionData, setTransactionData] = useState([]);
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
          { name: "Network", values: ["PermaPress"] }
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
        // Identify the most recent and oldest transactions
        const mostRecentTransaction = transactions.reduce((prev, current) => {
          return (prev.node.block.timestamp > current.node.block.timestamp) ? prev : current;
        });

        const oldestTransaction = transactions.reduce((prev, current) => {
          return (prev.node.block.timestamp < current.node.block.timestamp) ? prev : current;
        });

        // Extract Init-State tag from the most recent transaction
        const initStateTag = mostRecentTransaction.node.tags.find(tag => tag.name === "Init-State");

        if (initStateTag) {
          const initStateData = JSON.parse(initStateTag.value);
          transactionDetails.push({
            contractTxId,
            mostRecentTxId: mostRecentTransaction.node.id,
            mostRecentTimestamp: new Date(mostRecentTransaction.node.block.timestamp * 1000).toLocaleString(), // Convert timestamp to readable format
            oldestTxId: oldestTransaction.node.id,
            oldestTimestamp: new Date(oldestTransaction.node.block.timestamp * 1000).toLocaleString(), // Convert timestamp to readable format
            ...initStateData, // Spread init state data directly into the object
          });
        }
      }
    }

    setTransactionData(transactionDetails);
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

  return (
    <div>
      <SearchBar />
      <h2>Transaction Data</h2>
      <ul>
        {transactionData.map(({ contractTxId, mostRecentTxId, mostRecentTimestamp, oldestTxId, oldestTimestamp, owner, title, description, balance, price }) => (
          <li key={contractTxId}>
            <img 
  src={`https://arweave.net/${oldestTxId}`} 
  alt={`Oldest Transaction ID: ${oldestTxId}`} 
/><br></br>
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
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
