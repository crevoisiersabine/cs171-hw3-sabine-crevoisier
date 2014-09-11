1. Look at the data given in the Wiki table. Describe the data types. What is different from the datasets you've used before?
The data is of quantitative type. It is sparser than the data that we have looked at before. The data corresponds to predictions outputs from competing models about population estimates. The data is temporal as it corresponds to a population estimate for a given year.

2. Take a look at the DOM tree for the Wikipedia table. Formulate in jQuery selector syntax the selection that would give you the DOM element for the second row in the Wikipedia table. Write down in selection syntax how you would get all table rows that are not the header row.

I would select the second row in the table as follows:
var row2 = root.find(".wikitable tbody tr:eq(1)");

I could print each column element from that row as such:
$.each(row2, function(ix, val) {
    console.log($(val).text()); // print text
});

To get all the rows of the table but the header row, I could do the following selection (this uses the jquery selector "greater than"):
var rows = root.find(".wikitable tbody tr:gt(0)");