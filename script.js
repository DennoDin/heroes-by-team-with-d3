const axios = require("axios");

async function getHeroes() {
  const result = await axios.get('https://api.opendota.com/api/heroes');
  return result;
}


const MATCHES = 10; //number of matches to get

async function getSecretLastFifty() {
  const result = await axios.get('https://api.opendota.com/api/teams/1838315/matches');
  const secretMatches = result.data.map((match) => {
    return {
      id: match.match_id,
      radiant: match.radiant,
    }
  }).slice(0, MATCHES);
  return secretMatches;
}

async function secretHeroes() {
  const matchInfo = await getSecretLastFifty(); //calls function to get last matches
  const promiseArray = [];
  const apiStrings = matchInfo.map(match => ({ //converts matchInfo into api calls
    api: `https://api.opendota.com/api/matches/${match.id}`
  }));
  apiStrings.forEach((item) => { //creates promise array of api calls
    promiseArray.push(axios.get(item.api))
  })
  const promiseResults = await Promise.all(promiseArray); //returns an array of match details

  //parse hero picks from promiseResults
  //use match radiant val from matchInfo
  const parsedInfo = promiseResults.map((match, index) => {
    const heroPicks = [];
    let team = 1;
    if (matchInfo[index].radiant) {
      team = 0;
    }
    match.data.picks_bans.forEach(turn => {
      if (turn.is_pick && turn.team === team) {
        heroPicks.push(turn.hero_id);
      }
    })
    return heroPicks;
  })
  const heroes = await getHeroes();
  const mergedInfo = [];
  //check if mergedInfo has the hero in it
  parsedInfo.forEach(match => {
    match.forEach(heroId => {
      let found = false;
      if (mergedInfo.length > 0) {
        for (let i = 0; i < mergedInfo.length; i++) {
          if (mergedInfo[i].id === heroId) {
            mergedInfo[i].Count++;
            found = true;
          }
        }
      }
      //else, add the hero to the array
      if (!found) {
        let name;
        heroes.data.forEach(hero => {
          if (hero.id === heroId) {
            name = hero.localized_name;
          }
        })
        mergedInfo.push({
          id: heroId,
          Name: name,
          Count: 1
        })
      }
    })

  })
  console.log(mergedInfo);
  return { children: mergedInfo };
}
///d3 portion below///

/// test dataset ///
// dataset = {
//   "children": [{
//     Name: "Rubick",
//     Count: "1000"
//   },
//   {
//     Name: "Lina",
//     Count: "500"
//   },
//   {
//     Name: "Lion",

//     Count: "3200"
//   }]
// };

async function runD3() {
  const dataset = await secretHeroes();

  const diameter = 600;
  const color = d3.scaleOrdinal(d3.schemeCategory20);

  const bubble = d3.pack(dataset)
    .size([diameter, diameter])
    .padding(1.5);

  const svg = d3.select("body")
    .append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .attr("class", "bubble");

  const nodes = d3.hierarchy(dataset)
    .sum(function (d) { return d.Count; });

  const node = svg.selectAll(".node")
    .data(bubble(nodes).descendants())
    .enter()
    .filter(function (d) {
      return !d.children
    })
    .append("g")
    .attr("class", "node")
    .attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    });

  node.append("title")
    .text(function (d) {
      return d.Name + ": " + d.Count;
    });

  node.append("circle")
    .attr("r", function (d) {
      return d.r;
    })
    .style("fill", function (d, i) {
      return color(i);
    });

  node.append("text")
    .attr("dy", ".2em")
    .style("text-anchor", "middle")
    .text(function (d) {
      return d.data.Name.substring(0, d.r / 3);
    })
    .attr("font-family", "sans-serif")
    .attr("font-size", function (d) {
      return d.r / 5;
    })
    .attr("fill", "white");

  node.append("text")
    .attr("dy", "1.3em")
    .style("text-anchor", "middle")
    .text(function (d) {
      return d.data.Count;
    })
    .attr("font-family", "Gill Sans", "Gill Sans MT")
    .attr("font-size", function (d) {
      return d.r / 5;
    })
    .attr("fill", "white");

  d3.select(self.frameElement)
    .style("height", diameter + "px");

}

runD3();