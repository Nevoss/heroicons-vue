require('dotenv').config()

const fs = require('fs-extra')
const nodeGit = require('nodegit')
const path = require('path')
const htmlParser = require('node-html-parser')

const heroiconsRepoPath = path.resolve(`${__dirname}/../heroicons-repo`)
const outputJsonPath = path.resolve(`${__dirname}/../icons`)

const exec = async () => {
  const args = process.argv.slice(2);

  if (args.indexOf('--pull') > -1) {
    fs.removeSync(heroiconsRepoPath)

    await nodeGit.Clone(process.env.HEROICONS_GIT_URL, heroiconsRepoPath)
  }


  let finalRes = {}

  const dirs = {
    outline: `${heroiconsRepoPath}/dist/outline-md`,
    solid: `${heroiconsRepoPath}/dist/solid-sm`,
  };

  for (const dirKey in dirs) {
    const dirPath = dirs[dirKey]

    for (const fileName of fs.readdirSync(dirPath)) {

      let res = htmlParser.parse(fs.readFileSync(`${dirPath}/${fileName}`).toString())
      let key = fileName.split(/[a-z].-(.*)\.[^.]+$/)[1];

      let svg = res.querySelector('svg')

      if (!finalRes.hasOwnProperty(dirKey)) {
        finalRes[dirKey] = {}
      }

      finalRes[dirKey][key] = {
        attrs: svg.attributes,
        path: svg.querySelectorAll('path').map(path => {
          return path.attributes
        })
      }
    }

    fs.writeFileSync(`${outputJsonPath}/${dirKey}.js`, 'export default ' + JSON.stringify(finalRes[dirKey]))
  }
}

exec()
