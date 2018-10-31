IMPORTANT:

Dashcore-lib seems to have a specific problem when translating public keys to an elliptic derivative.

Using a hack I have disabled the toDER on empty objects in the following file:
 dashcore-lib/lib/publickey.js   (line 379)

When updating dashcore-lib, make sure to check for this problem, and fix it if necessary.

