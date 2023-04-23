One of my friends (**note:** link/name?) was accepting beta testers to TestFlight through a Google Form
exporting to a Google Sheet. The form was set up with two fields, name and email,
however TestFlight requires a CSV with three columns: first name, last name, and
email.

(**note:** insert image of redacted spreadsheet responses)

## Parsing the Responses

To convert the two-column data to the three-column CSV, we first created a new sheet.
We placed headers at the top for our own reference, First Name, Last Name, and Email,
then created a formula to extract each part from the first sheet. The first sheet,
named "Testers", contained all the responses from the form. To split the name, we
started by using the `SEARCH` function, the Google Sheet/Excel equivalent of `index`
/`indexOf`/`index(where:)`, to check if there was a space in the name that we could
use to split: `SEARCH(" ", Testers!$B2)`. If there was, the formula used the `LEFT`
function to create a substring up to that space:
`LEFT(Testers!$B2, SEARCH(" ", Testers!$B2))`. If not, it returned the original
content of the cell. The full formula for the first name column is as follows.

```excel-formula
=IF( ISNUMBER(SEARCH(" ", Testers!$B2)), LEFT(Testers!$B2, SEARCH(" ", Testers!$B2)), Testers!$B2 )
```

The last name column has a similar formula, with two differences. The first is that
the `RIGHT` function is used instead of `LEFT`. `RIGHT` returns a substring starting
from the end of the string. Because the `RIGHT` function is used, the `SEARCH` call
inside it has to be subtracted from the total length of the string:
`LEN(Testers!$B2) - SEARCH(" ", Testers!$B2)`. The full formula for the last name
column is below.

```excel-formula
=IF( ISNUMBER(SEARCH(" ", Testers!$B2)), RIGHT( Testers!$B2, LEN(Testers!$B2) - SEARCH(" ", Testers!$B2) ), Testers!$B2 )
```

The email formula is very simple, just a reference to the cell in the responses
sheet: `=Testers!$C2`. The three formulas are copied to all the rows in the sheet.

(**note:** insert image of redacted spreadsheet)

## Cleaning the Responses

The next step was to upload it to TestFlight, but TestFlight threw an error with
the most helpful message ever: "An error has occurred. Try again later." Apple,
being its usual helpful self, opted to not provide any useful information that could
help fix the errors with the CSV. After much trial and error, my friend was able
to successfully import his CSV. But the amount of work it took to hunt down errors
in a CSV led me to create [TestFlight Cleaner](/program/testflight-cleaner). TestFlight
Cleaner cleans your tester CSVs for you, and optionally shows why it's removing
some entries.

## TestFlight Cleaner

(**note:** insert screenshot)

The first thing I had to do was figure out how to import a CSV and parse it using
JavaScript^[I use TypeScript, but the only difference is that TypeScript is, well, typed, and JavaScript isn't.]. After reading through Stack Overflow, I stumbled
upon the [FileReader](https://developer.mozilla.org/en-US/docs/Web/API/FileReader)
API, which has a convenient `readAsText` function. Since my website uses Next.js
which uses React, I used a [`useState` hook](https://react.dev/reference/react/useState)
to store the `File` object that the file input would provide, then I accessed that
in a function. The function converts the file to text using the aforementioned function,
then begins to process the CSV.^[[`upload`, lines 187-206](https://github.com/hkamran80/website/blob/redesign-nextjs/pages/program/testflight-cleaner.tsx#L187-L206)]

The first step is to turn the raw data into a two-dimensional array. The CSV text
was split using the newline character `\n`, then each row was split using a comma
as a delimiter. This output was stored in another `useState` hook.^[[`processCsv`, lines 50-51](https://github.com/hkamran80/website/blob/redesign-nextjs/pages/program/testflight-cleaner.tsx#L50-L51)]

The next step is triggered via a [`useEffect` hook](https://react.dev/reference/react/useEffect)
monitoring the `csvData` `useState` hook, which is set by the `processCsv` function
in the previous step. This step is the error-checking step. The first check is
[a column count](https://github.com/hkamran80/website/blob/redesign-nextjs/pages/program/testflight-cleaner.tsx#L56-L67).
If it detects more or less than three columns, the step fails, and the user is prompted
to fix the CSV. The other error is [a malformed email check](https://github.com/hkamran80/website/blob/redesign-nextjs/pages/program/testflight-cleaner.tsx#L69-L98),
which checks if an email contains an `@` sign and matches
[a comprehensive regular expression](https://github.com/hkamran80/website/blob/redesign-nextjs/pages/program/testflight-cleaner.tsx#L80).
If this check fails, it lets the user know and continues, because it can bypass
these rows. Finally, another `useState` hook is used to inform another `useEffect`
hook that this step is complete.^[[`checkForErrors`, lines 53-101](https://github.com/hkamran80/website/blob/redesign-nextjs/pages/program/testflight-cleaner.tsx#L53-L101)]

The third step is to clean the CSV using a reducer. There are two settings the user
can apply that affect this function: specifying the first row as the header row,
and leaving malformed/duplicated rows in the preview. The first part of this step
is to check if the email has appeared in any preceding rows. If it has and the leave
duplicated rows setting is active, it outputs a "duplicate" flag, and adds it to
the array. If it has and the setting is inactive, it returns the existing array.
The next part is to check for malformed emails, achieved by performing a similar
check as step two. If the leave malformed rows setting is active, it outputs a "malformed"
flag, then adds it to the array. If neither of these parts are triggered, the reducer
returns the same cleaned rows that are output in every step. The [cleaning](https://github.com/hkamran80/website/blob/redesign-nextjs/pages/program/testflight-cleaner.tsx#L103-L104)
strips all characters that aren't alphanumeric, periods, dashes, spaces or
non-English characters from the first and last names. The email gets line break
characters stripped. Finally, the function sets a `useState` hook with the cleaned
data, and another `useState` hook with any duplicated emails. The duplicated emails
hook is set only if the leave duplicated rows setting is active.^[[`cleanCsv`, lines 106-185](https://github.com/hkamran80/website/blob/redesign-nextjs/pages/program/testflight-cleaner.tsx#L106-L185)]

The final step is to make the preview. It loops over the two-dimensional cleaned
CSV data to create a table, and if a malformed or duplicate flag is set, it places
a colour on the email. Red signifies malformed and yellow signifies duplicated.^[[Table generation, lines 437-520](https://github.com/hkamran80/website/blob/redesign-nextjs/pages/program/testflight-cleaner.tsx#L437-L520)]

After a user requests an export using the button below the preview, a [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob)
is created by iterating over the cleaned rows to form it back into a CSV. An
[anchor element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a) is
created, with its URL set to the output of
[`URL.createObjectURL`](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL).
A download attribute is also set, which sets the filename to "TestFlight Testers
- Cleaned.csv". This element is then added to the
DOM^[[Document Object Model](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction)],
clicked, then removed. The object URL is also revoked.^[[`exportCsv`, lines 221-241](https://github.com/hkamran80/website/blob/redesign-nextjs/pages/program/testflight-cleaner.tsx#L221-L241)]

I hope that this tool comes in handy for you. If it does or you have any feedback,
please contact me on [Twitter](https://twitter.com/hkamran80) or [Mastodon](https://vmst.io/@hkamran).
Thank you for reading!