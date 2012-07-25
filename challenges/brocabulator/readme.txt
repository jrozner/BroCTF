// Brocabularizer

In short, this network service has a simple regex.  You give it a word, and it will brocabularize it for you. 

Example:

professional => brofessional

Now, not all words will work.  In that case, "sorry bro."

Vulnerability: format string

This daemon will actually accept %100x for example, as it will simply print to printf() without any real format string to speak of.  

Exploitation should be simply adjusting the number between % and x as to how many bytes down the stack you wish to read. 

The key will be there somewhere, though it will be read into a buffer from a file, to prevent recovering the key through static analysis (e.g.: strings).  

There will be some red herring sha1 hashes in there though for good measure.


