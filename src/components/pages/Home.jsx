import React, { useState, useEffect } from "react";
import { request, gql } from "graphql-request";
import SearchBar from "../SearchBar"; // Import SearchBar

export const Home = () => {
  const [results, setResults] = useState([]);

  const homeQuery = gql`
    query($name: String!, $values: [String!]!) {
      transactions(
        tags: {
          name: $name
          values: $values
        }
      ) {
        edges {
          node {
            id
            owner {
              address
            }
            data {
              size
              type
            }
            tags {
              name
              value
            }
            block {
              timestamp
            }
          }
        }
      }
    }
  `;

  const variables = {
    name: "Network",
    values: ["PermaPress"],
  };

  const endpoint = "https://arweave.net/graphql";

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const result = await request(endpoint, homeQuery, variables);
        const edges = result.transactions.edges;

        const resultsBuilder = edges.map((edge) => {
          const initStateTag = edge.node.tags.find(tag => tag.name === "Init-State");

          let parsedInitState = {};
          if (initStateTag) {
            try {
              parsedInitState = JSON.parse(initStateTag.value);
            } catch (error) {
              console.error("Error parsing Init-State", error);
            }
          }

          // Check if block is available before accessing timestamp
          const timestamp = edge.node.block 
            ? new Date(edge.node.block.timestamp * 1000).toISOString() 
            : "N/A";

          return {
            txID: edge.node.id,
            owner: parsedInitState.owner || "Unknown Owner",
            title: parsedInitState.title || "Untitled",
            description: parsedInitState.description || "No description",
            size: edge.node.data.size,
            type: edge.node.data.type,
            timestamp: timestamp,
            price: parsedInitState.price || "N/A",
          };
        });

        const sortedResults = resultsBuilder.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );

        setResults(sortedResults);
      } catch (error) {
        console.error("GraphQL query failed", error);
      }
    };

    fetchResults();
  }, []);

  return (
    <>
      <div>
        <h1 className="text-center text-2xl font-bold my-5">Easy Minter 2000</h1>
        {/* Searchbar component */}
        <SearchBar />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
        {results.map((result, index) => (
          <div key={index} className="border rounded-lg p-4 shadow-lg bg-white">
            <div className="flex justify-center items-center">
              <img
                src={`https://arweave.net/${result.txID}`}
                alt={`Transaction ${result.txID}`}
                className="w-full h-40 object-cover"
              />
            </div>
            <div className="mt-3">
              <h3 className="text-lg font-semibold text-primary">Transaction ID:</h3>
              <a
                className="text-sm break-words text-blue-500 hover:underline"
                href={`https://viewblock.io/arweave/tx/${result.txID}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {result.txID}
              </a>
              
              <h3 className="text-lg font-semibold text-primary mt-3">Title:</h3>
              <p className="text-sm break-words">{result.title}</p>
              
              <h3 className="text-lg font-semibold text-primary mt-3">Owner:</h3>
              <p className="text-sm break-words">{result.owner}</p>
              
              <h3 className="text-lg font-semibold text-primary mt-3">Description:</h3>
              <p className="text-sm">{result.description}</p>

              <h3 className="text-lg font-semibold text-primary mt-3">Price:</h3>
              <p className="text-sm">{result.price}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Home;
