const fetchPaginatedProducts = async (url: string, headers = {}) => {
  let allProducts = [];
  const limit = 250; // Number of products per page
  let page = 1; // Start pagination from page 1
  let i = 0;

  while (true) {
    console.log("iteration ", i);
    i++;

    const paginatedUrl = `${url}?limit=${limit}&page=${page}`;
    console.log(`Fetching: ${paginatedUrl}`);

    const res = await fetch(paginatedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0",
        Accept: "application/json",
        ...headers,
      },
      method: "GET",
    });

    if (!res.ok) {
      console.error(`Failed to fetch data from ${url}: ${res.statusText}`);
      break;
    }

    const data = await res.json();
    console.log(`Fetched ${data.products.length} products in this iteration.`);

    if (!data.products || data.products.length === 0) {
      console.log("No more products to fetch.");
      break;
    }

    allProducts = allProducts.concat(data.products);
    page++;
  }

  return allProducts;
};
