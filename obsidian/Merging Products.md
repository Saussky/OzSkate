Separate page and gpt written functions are in place for doing the merge, need to review and add TODO's for clean up and clarity.

Need to update storefront and make sure both aren't appearing, and that one the original it displays that it is available at more than one shop

What about products that aren't caught by the Levenshtein? Need to add manual process from storefront, admin powers only obviously
- Need to search for the product which is also needed for filtering, best to build cohesively for both purposes
- Alternatively, use Levenshtein still but lower the required accuracy. Will need filtering anyway so best start with the search