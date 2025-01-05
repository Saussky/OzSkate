Generally just need to use the website url + products.json
It has a limit on items it will return
3 Ways to get all the data

1. page (deprecated in some cases but still works on many stores):

	• Example: /products.json?page=2
	
	• Change the page number incrementally to retrieve the next set of products.

2. limit:

	• You can specify the number of products to return per page (up to 250).
	
	• Example: /products.json?limit=250

3. since_id (preferred for larger stores):

	• Use the id of the last product retrieved to fetch the next batch of products.
	
	• Example: /products.json?limit=250&since_id=123456




**HOW TO SCRAPE ALL**

1. Start with the first page: /products.json?limit=250&page=i.

2. Increase 'i' until products array is empty then exit the while loop

For scheduled scraping, it might be worth using the since_last_id parameter or something similar (find documention) so we don't have to parse through products we've already added
5. 