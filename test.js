const fetchContractSrcValues = async () => {
  const query = `
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
    }
  `;

  try {
    const response = await fetch('https://arweave.net/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    // Check if result.data exists
    if (!result.data || !result.data.transactions) {
      console.error("No transactions found.");
      return [];
    }

    // Extract Contract-Src values
    const contractSrcValues = result.data.transactions.edges
      .map(edge => {
        const contractSrcTag = edge.node.tags.find(tag => tag.name === "Contract-Src");
        return contractSrcTag ? contractSrcTag.value : null;
      })
      .filter(value => value !== null); // Filter out null values

    console.log("Contract-Src values:", contractSrcValues);
    return contractSrcValues;

  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

