One of my friends was accepting beta testers to TestFlight through a Google Form
exporting to a Google Sheet. The form was set up with two fields, name and email,
however TestFlight requires a CSV with three columns: first name, last name, and
email.

(insert image of redacted spreadsheet)

To convert the two-column data to the three-column CSV, we first created a new sheet. We placed headers at the top for our own reference, First Name, Last Name, and Email, then created a formula to extract each part from the first sheet. The first sheet, named "Testers", contained all the responses from the form. To split the name, we started by using the `SEARCH` function, the Google Sheet/Excel equivalent of `index`/`indexOf`/`index(where:)`, to check if there was a space in the name that we could use to split: `SEARCH(" ", Testers!$B2)`. If there was, the formula used the `LEFT` function to create a substring up to that space: `LEFT(Testers!$B2, SEARCH(" ", Testers!$B2))`. If not, it returned the original content of the cell. The full formula for the first name column is as follows.

```excel-formula
=IF( ISNUMBER(SEARCH(" ", Testers!$B2)), LEFT(Testers!$B2, SEARCH(" ", Testers!$B2)), Testers!$B2 )
```