function runServer_onclick() {
    google.script.run
        .withSuccessHandler(runSomeAppsScriptSuccess)
        .runSomeAppsScript(mode);
}

function runSomeAppsScriptSuccess(result) {
    console.log('runSomeAppsScript result', result);
}

function runClient_onclick() {


    console.log('Mode:', mode);
    console.log({
        message: 'This is a response from a client-side function.',
        status: 'ok'
    });
}

// The code in this function runs when the page is loaded.
var radarData = null;

$(function() {
    google.script.run
        .withSuccessHandler(populatePersonSelect)
        .getResponsesByQuestionTitle('Person name');
});

function populatePersonSelect(response) {
    console.log(response);
    var select = $('#PersonSelect');
    select.empty();
    if (response.status === 'OK') {
        for (var i = 0; i < response.persons.length; i++) {
            select.append('<option>' + persons[i] + '</option>');
        }
        $('#createChart').prop('disabled', false);
        $('#form').show();
    } else {
        console.log(response);
    }
    $('#loader').hide();
}


function generateImage() {

    $('#chart svg').attr('id', 'downloadChart');
    saveSvgAsPng(document.getElementById("downloadChart"), $('#PersonSelect').val().toLowerCase().replace(/\s/g, '-') + ".png");
}


function getPersonSkillRadar() {
    $('#loader').show();
    $('#createChart').prop('disabled', true);
    $('#downloadImg').prop('disabled', true);
    $('#chart').empty();
    google.script.run.withSuccessHandler(drawRadar).getPersonData($('#PersonSelect').val());

}

function drawRadar(radarData) {



    var w = 450,
        h = 450;

    var colorscale = d3.scale.category10();

    //Legend titles
    var LegendOptions = radarData.legendOptions;

    //Data
    var d = radarData.data;

    //Options for the Radar chart, other than default
    var mycfg = {
        w: w,
        h: h,
        maxValue: 6,
        levels: 6,
        ExtraWidthX: 300
    };

    $('#loader').hide();
    $('#createChart').prop('disabled', false);
    $('#downloadImg').prop('disabled', false);

    //Call function to draw the Radar chart
    //Will expect that data is in %'s
    RadarChart.draw("#chart", d, mycfg);

    ////////////////////////////////////////////
    /////////// Initiate legend ////////////////
    ////////////////////////////////////////////

    var svg = d3.select('#body')
        .selectAll('svg')
        .append('svg')
        .attr("width", w + 300)
        .attr("height", h);

    //Create the title for the legend
    var devName = svg.append("text")
        .attr("class", "title")
        .attr('transform', 'translate(90,0)')
        .attr("x", -20)
        .attr("y", 15)
        .attr("font-size", "16px")
        .attr("fill", "#202020")
        .text($('#PersonSelect').val());

    //Create the title for the legend
    var text = svg.append("text")
        .attr("class", "title")
        .attr('transform', 'translate(90,0)')
        .attr("x", w + 40)
        .attr("y", 10)
        .attr("font-size", "12px")
        .attr("fill", "#404040")
        .text("Skill group");

    //Initiate Legend
    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("height", 100)
        .attr("width", 200)
        .attr('transform', 'translate(90,20)');
    //Create colour squares
    legend.selectAll('rect')
        .data(LegendOptions)
        .enter()
        .append("rect")
        .attr("x", w + 40)
        .attr("y", function(d, i) {
            return i * 20;
        })
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", function(d, i) {
            return colorscale(i);
        });
    //Create text next to squares
    legend.selectAll('text')
        .data(LegendOptions)
        .enter()
        .append("text")
        .attr("x", w + 53)
        .attr("y", function(d, i) {
            return i * 20 + 9;
        })
        .attr("font-size", "10px")
        .attr("fill", "#737373")
        .text(function(d) {
            return d;
        });
}
