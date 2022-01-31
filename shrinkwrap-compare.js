const ci = require("./cli-installed-next.json");
const gh = require("./cli-github-next.json");
const cv = require("./cli-verdaccio-next.json");

const filterPkgs = (obj, str) => {
  const ret = [];
  for (const pkg of Object.keys(obj.packages)) {
    if (pkg === "" || pkg.startsWith("__tests__")) continue;
    if (pkg === "node_modules/@zowe/cli") continue;
    if (obj.packages[pkg].dev) continue;
    ret.push({name: pkg, obj: obj.packages[pkg]});
  }
  ret.sort((a, b) => a.name > b.name);
  console.log("Package count in", str, ":\t", ret.length);
  return ret;
}

const ciPkgs = filterPkgs(ci, "<installed version>");
const ghPkgs = filterPkgs(gh, "<github version>");
const cvPkgs = filterPkgs(cv, "<verdaccio version>");

const matchPkgs = (a, b) => {
  return a.obj.integrity === b.obj.integrity ||
    a.obj.resolved === b.obj.resolved ||
    a.name.indexOf("for-zowe-sdk") >= 0 ||
    (a.obj.version === b.obj.version && (
      a.name === b.name || b.name.indexOf(a.name.split("/").slice(-1)[0]) >= 0
    ));
}

const cvMiss = [];
const ghMiss = [];
ciPkgs.forEach((pkg) => {
  if (!cvPkgs.find((p) => matchPkgs(pkg, p))) cvMiss.push(pkg);
  if (!ghPkgs.find((p) => matchPkgs(pkg, p))) ghMiss.push(pkg);
});

console.log("");
console.log("Package integrity missed in <verdaccio version>:", cvMiss);
console.log("Package integrity missed in <github version>:\t", ghMiss);

const cvMissPkgs = [];
for(const pkg in cvPkgs) {
  if (ciPkgs.find((p) => cvPkgs[pkg].name === p.name )) continue;
  cvMissPkgs.push(cvPkgs[pkg]);
};

console.log("");
console.log("Duplicate dependencies in <verdaccio version>\t", cvMissPkgs.length);

const ghMissPkgs = [];
ghPkgs.forEach((pkg) => {
  if (!ciPkgs.find((p) => pkg.name === p.name)) ghMissPkgs.push(pkg);
});
console.log("Duplicate dependencies in <github version>\t", ghMissPkgs.length);
