- Products will have different titles depending on the store, even though they are the same product. Same for the product type. Figure out how to fix?
	- Manually create logic? There's only ~20 stores. 
	- Modify the helper functions to set the product type
	- Also remove most of the other stuff it isn't needed
- Account creation (basic)
	- Done, can login too. need to add email verification and protecting certain components in the header?
	- Email verification: https://v3.lucia-auth.com/guides/email-and-password/email-verification-codes
- Variant images need looking into
- Once we display products only once even though it has multiple stores. Choose the image based on a ranking system of stores. OCD probably has the best images.
	- Try to get all the same size though.
	- Could filter by which image size is closest to what gets chosen for the size of the thumbnail
- Filter by 'on sale'
	- Basics done.
	- Needs to be fleshed out.  Sale filter by % decrease, $ decrease etc.
- Implement category casting in fetchShopifyProducts
	- - Mostly done, still needs some work
	- Need master category taxonomy
- Find out how much stock there is of womens clothing in skate stores, might just give it tops and bottoms, assume most clothing is mens?
- Figure out difference between prod and local db instances
- Admin login?


Because its *variants* that are on sale, it might only be certain colours of a t-shirt so showing a variant that *isn't* for sale is misleading at best. Might need to write logic that will show the image of the first variant that is on sale.


*TODO's 5/01/24*
- Create master category taxonomy, browse each store to get an idea (then steal ocd's)
	- Create documentation diagram using figma
- Figure out identical products process
- Finish creating accounts
	- Hiding admin page
- Hosting, don't need to wait till it's done, can be worked on incrementally
- Extensive filters, optional modal?
	- Check other online aggregators for filter ideas
- UI
- Email notifications for price drops
- Updating products the least computationally expensive way
- Sort by state(s)?
- Images sometimes too zoomed in, weren't before