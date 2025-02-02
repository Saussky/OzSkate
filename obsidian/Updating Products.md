Stores will update with new products every so often, but more importantly they might update prices of existing products.

Our existing products will need updating and the frequency will depend on the stores, most likely it would occur weekly. 

It's also possible that items might get sold-out and so would need to check on this more often, as it isn't a scheduled event.


**Option #1** 
We delete the products and pull in all of them every hour or so. Computationally expensive, takes ~20 minutes and we'd lose all manual changes to the products such as recategorisations and duplicates. 

Instead of replacing the products we could compare the product Ids, if they match just see if the recently fetched product has any new prices (or is out of stock) and if so, update the existing product.
	- Might it be easier to just update the product with that information regardless? Probably not as that's adding more read/write

We could store the manual changes separately and re-apply them with every import
