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
- Figure out identical products process ☑️
	- Shoe colourways aren't handled in variants, they are all their own product
	- Variants are mainly sizes, which will have to be handled eventually
- Finish creating accounts ☑️
	- Hiding admin page ☑️
- Hosting, don't need to wait till it's done, can be worked on incrementally
- Extensive filters, optional modal?
	- Check other online aggregators for filter ideas
- UI
- Email notifications for price drops - ignore do later
- Updating products the least computationally expensive way
- Sort by state(s) (location)?
- Images sometimes too zoomed in, weren't before

*TODO's 2/02/24*
- Master category taxonomy
- Images sometimes too zoomed in
- Hosting
- Filtering by state, organisaing where to put all the filters
- Updating products - priority #1
	- Mostly done, need to sync with duplicate managing
- Signifying the products have duplicates in storefront / product card
	- Getting the cheapest price
- Make a bot that will watch 50-50.com.au to track the buying notifications that appear when any customer purchases something, track $ over time to get an idea of shops daily intake
- Some product links show the item as unavailable
	- Have now filtered by the 'available' column
- Shoe sizes are different priced, this should affect results in storefront
- Move actions into directories they are used, make lots of them
- Brands only shows whats available, so if you select 'vans', then once it loads you will only see 'vans' in the brands dropdown
	- Brands also need standardizing e.g SLAPPY, SLAPPY TRUCKS, slappy etc.

TODO 2/3/25
- Finish merged brands
- For merged products, need to display that it is at multiple stores
	- Display states using Melbourne Melee icons?
	- Display cheapest price, will need to create logic for that
- Figure out a pipeline so that the site will do migrations when pushing
- Filters, search by brand like in depop
- Clean up filters UI
- Mobile UI

TODO 23/3/25
- Fix merged products, storing duplicates within the table of products isn't a good idea
	- Separate
- Running site in production mode
	- Login isn't persisting in prod?
		- Something to do with lucia file maybe? Cookies.set generally needs a "use server" but we can't have that in the same file as exporting a non-async function such as auth
			- Needs https to set cookies - DONE
- HTTPS certification - DONE
- Header too big in mobile
	- Whole mobile layout needs looking at
- Admin controls in product to mark as duplicate
	- Search for other products in this menu
- Product updates also need to look for photos
- Australian brands get a different card display, green and gold? red, yellow and black?
- Shop dropdown needs to be a multiselect - DONE(ish)
- Product master might not be available, then it gets filtered out when one of the duplicates might actually be in stock
	- This needs to be separated into a function to automatically set one, and then put it in the duplicates queue again?

FIRST PRIORITY
- Login fix
- HTTPS

TODO 6/4/2025
- Login needs to work with uname AND email
	- -it does, uname is case sensitive
- Mobile design
- Be able to mark duplicate through storefront somehow as admin
- Filter to hide items with no photos, automatically on
- Handling of duplicates that are unavailable
	- they should automaticallly lose 'master' status
	- re put back in the queue to check which should be master if multiple duplicates
- Renaming parent and child type to whatever depop use, just front-end
- GPT logo creation?
- Fix product update errors
	- Isn't an error, it just takes too long, need to fire events or write updates to a new table and display them

TODO 14/4/2025
- Figure out launch
- Make more distinct mobile plan
	- Header + filters
	- Use iphone for testing
- Saving users filter preferences
	- Cookies?
- Removing scooter + snow - DONE
	- Filter by name, type or remove the shops?
- Multiple brand select option
- Search select
- Duplicates that are unavailable
- Renaming of parent and child type - DONE
- Mark duplicate through product card
- Filter non-photos
- Track new products and price changes and store, view in admin
- Site analytics!
- Chron job for updating products, and clearing npm cache?
	- Figure out better way to do build process

TODO 17/5/2025
- Multi select for brands
	- Modify query params
	- DONE, might need to change to default dropdown to get native mobile ui
- Group shops via state
	- Select options as '---VIC---', unclickable
		- Order via users location proximity?
	- Or just display state Melbourne Melee logo next to them
		- Might be a pain for mobile
- Mobile filter display and mobile header display
	- PRIORITY #1
	- DONE, could still use work but in a neater position
- Press enter to apply filters
	- DONE
- Get proper image for non-photos, check these specific products for photo update
- Cookies investigation
- Professional sign up UX
	- Store user data here instead of cookies
- Mark as suspected duplicate through new action menu
- Duplicates that are unavailable
- Analytics
- Chron jobs
- Logging
- On sale needs to be updated properly on updating products
	- DONE, file needs a cleanup
		- Cleaned up but logic needs to be understood better

TODO 7/6/25
- ~~Logs in update products, need to see that info, store in db somewhere?~~
- ~~Filter by how recent the product went on sale~~
- ~~Delete products and make sure they don't get re-added~~
- - Analytics
- ~~Chron jobs
- Logging
- Duplicates, make decision
-  Get proper image for non-photos, check these specific products for photo update
- Cookies investigation
- Professional sign up UX
	- Store user data here instead of cookies
- ~~Show sort option~~
- ~~Manually merge brands~~

- Figure out if recently updated is showing the items most recently put on sale
- Email verification
- User data privacy?
- Back up storage for user data?
	- All data?
		- Some data?
- Storing users searches for statistics
	- Storing every db query? Research into this
- Show vendor name in product card?
	- Remove vendor name from product title?
		- And all things after it e.g '-' and whitespace?
- Take a look at product categories
	- Think shoes need fixing for youth and womens
- Product images not loading properly on main
	- - DONE

Looks like some of lofi stuff isn't actually on sale


TODO 15/7
- ~~Add contact part with newly created email~~
- Analytics
- Look into twilio or some email verification service
- ~~Changing sort order will remove the sale checkbox if apply hasn't been clicked~~
- ~~No img image~~
- ~~Spinner for product cards~~
- ~~Update images if they are missing
	- -TEST THIS
		- broke everything
- ~~Use ig logo in footer~~
- ~~Product update from cron job not updating prices or something?

TODO 27/7
- change analytic time from 30 minutes to something longer
- ~~image size for placeholder 
	- ~~and some products too zoomed in
- Deselect a store or brand
	-Maybe on the product card itself?
- ~~Use ig logo~~
- ~~on mobile, have filters drop down if button pressed, takes up too much space otherwise~~
- use badge like thing to do 'new products', 'newest on sale', 'dunks', 'aus'
	- ~~have basic filters applying on mobile~~
		- ~~Add clear quick filters
- ~~test on mobile~~
- ~~show filters button probably need styling~~
- ~~loading skeletons instead of spinner~~
- ~~post it on slap~~
- ~~taller dropdowns~~
- ~~on sale price show normal pricing crossed out~~
- ~~smaller limit mobile~~
- ~~hovers back to top scroll for mobile~~
	~~option to see two items or 4~ items~~
- ~~remove login box~~


TODO 21/8
- Finish store badge hrefs
	- Deselect a store
		- Tip on hover?
- Make marketing plan
	- Advertise on skatermaps, and ig?
- Fix the records being displayed by middle store
- Investigate why lofi keeps appearing in last updated on sale
-

vic gov enagge submission ids
**1374605** - moreland
**1374607** - upfield station