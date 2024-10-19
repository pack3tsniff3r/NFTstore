import React, { useState, useEffect } from "react";
import { useActiveAddress } from "arweave-wallet-kit";
import { useNavigate } from 'react-router-dom';
import NavBar from "../NavBar";
import SearchBar from "../SearchBar";
import Swiper from 'swiper';
import 'swiper/swiper-bundle.css';

export const Profile = () => {
  const [contractTxIds, setContractTxIds] = useState([]);
  const [transactionData, setTransactionData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const activeAddress = useActiveAddress();
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
    const seenTxIds = new Set();

    networkTransactions.forEach(transaction => {
      transaction.node.tags.forEach(tag => {
        if (tag.name === "Contract-Src" && !seenTxIds.has(tag.value)) {
          seenTxIds.add(tag.value);
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
    const uniqueTxIds = new Set(); // Keep track of unique transaction IDs

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
          
          // Check if the owner in Init-State matches the active wallet address
          if (initStateData.owner === activeAddress && !uniqueTxIds.has(mostRecentTransaction.node.id)) {
            uniqueTxIds.add(mostRecentTransaction.node.id);

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
    setFilteredData(transactionDetails);
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

  const handleMoreInfoClick = (nftData) => {
    navigate('/info', { state: nftData });
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

  const handleSearchBarToggle = () => {
    setIsSearchVisible(prev => !prev);
  };

  useEffect(() => {
    const swiper = new Swiper('.swiper-container', {
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      loop: true,
      slidesPerView: 1,
      breakpoints: {
        640: {
          slidesPerView: 4,
          spaceBetween: 20,
        },
      },
    });
  }, [filteredData]);

  return (
    <div className="bg-gray-900 text-white p-4 min-h-screen">
      <NavBar onSearchBarToggle={handleSearchBarToggle} />
      {isSearchVisible && <SearchBar onSearch={handleSearch} />}

      <h2 className="text-2xl font-bold mb-4">My NFTs</h2>

      {filteredData.length > 0 ? (
        <div className="swiper-container">
          <div className="swiper-wrapper">
            {filteredData.map(({ contractTxId, mostRecentTxId, mostRecentTimestamp, oldestTxId, oldestTimestamp, owner, title, description, balance, price }) => (
              <div className="swiper-slide" key={contractTxId}>
                <div className="bg-gray-800 rounded-lg p-4 shadow-lg border border-silver">
                  <img 
                    src={`https://arweave.net/${oldestTxId}`} 
                    alt={`Oldest Transaction ID: ${oldestTxId}`} 
                    className="rounded-md w-full h-auto"
                  />
                  <h3 className="text-lg font-bold text-white mt-2">{title}</h3>
                  <p className="text-white">{description}</p>
                  <p className="text-white font-semibold">Price: {price} AR</p>
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => handlePurchaseClick({ contractTxId, price, owner, oldestTxId, title, description })}
                      className="bg-green-600 text-black py-2 px-4 rounded-full hover:bg-green-500 transition"
                    >
                      Buy Now
                    </button>
                    <button
                      onClick={() => handleMoreInfoClick({ contractTxId, owner, price, mostRecentTxId, title, description, oldestTxId })}
                      className="bg-purple-600 text-black py-2 px-4 rounded-full hover:bg-purple-500 transition"
                    >
                      More Info
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="swiper-button-next"></div>
          <div className="swiper-button-prev"></div>
          <div className="swiper-pagination"></div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-silver text-center">
            <h3 className="text-xl font-semibold text-white">No NFTs Found</h3>
            <p className="text-gray-400">There are no NFTs associated with your wallet address.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
