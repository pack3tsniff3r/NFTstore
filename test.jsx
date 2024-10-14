const contractTxID = "-A7klR6Q9YBF4GRFD9JWoOii8J9YnufNxLIeGh5KnBQ"
async function fetchMostRecentTransaction(contractTxID) {
  // Define the GraphQL query
  const query = `
    {
      transactions(
        first: 1
        tags: [
          { name: "Contract", values: ["${contractTxID}"] }
        ]
        sort: HEIGHT_DESC
      ) {
        edges {
          node {
            id
            owner {
              address
            }
            block {
              height
              timestamp
            }
            tags {
              name
              value
            }
          }
        }
      }
    }
  `;

  try {
    // Send the request to the Arweave GraphQL API
    const response = await fetch('https://arweave.net/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    // Parse the JSON response
    const result = await response.json();
    
    // Check if we got a transaction result
    if (result.data.transactions.edges.length === 0) {
      console.log("No transactions found for this contract.");
      return null;
    }

    // Get the most recent transaction node
    const mostRecentTransaction = result.data.transactions.edges[0].node;

    // Log and return the most recent transaction data
    console.log('Most recent transaction:', mostRecentTransaction);
    return mostRecentTransaction;

  } catch (error) {
    // Handle any errors that occur during the request
    console.error('Error fetching most recent transaction:', error);
    return null;
  }
}

