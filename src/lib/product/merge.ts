/*
If a product is a duplicate we can add a new column/relation to the product table called 'duplicate_product'
Then when presenting to the front-end, we can mention it's at X other stores.
Also when displaying the price we can get the price of all variants, show the cheapest one.

What about multiple products having multiple duplciates? Column might have to be an array of duplicate products if that's possible.
Will also need to modify the cheapestPrice logic to check all duplicate product variants too
*/