import win from "./window"
import { Map } from "immutable"

/**
 * if duplicate key name existed from FormData entries,
 * we mutated the key name by appending a hashIdx
 * @param {String} k - possibly mutated key name
 * @return {String} - src key name
 */
const extractKey = (k) => {
  const hashIdx = "_**[]"
  if (k.indexOf(hashIdx) < 0) {
    return k
  }
  return k.split(hashIdx)[0].trim()
}

export default function curl( request ){
  let curlified = ""
  const addWords = (...args) => curlified += " " + args.join(" ")
  const addWordsWithoutLeadingSpace = (...args) => curlified += args.join(" ")
  const addNewLine = () => curlified += " \\\n"
  const addIndent = (level = 1) => curlified += "  ".repeat(level)
  let isMultipartFormDataRequest = false
  let headers = request.get("headers")
  curlified += "curl"

  if (request.get("curlOptions")) {
    addWords(...request.get("curlOptions"))
  }

  addWords("-X", request.get("method"))

  addNewLine()
  addIndent()
  addWordsWithoutLeadingSpace( `"${request.get("url")}"`)

  if ( headers && headers.size ) {
    for( let p of request.get("headers").entries() ){
      addNewLine()
      addIndent()
      let [ h,v ] = p
      addWordsWithoutLeadingSpace("-H", `'${h.replace(/'/g, "'\\''")}: ${v.replace(/'/g, "'\\''")}'`)
      isMultipartFormDataRequest = isMultipartFormDataRequest || /^content-type$/i.test(h) && /^multipart\/form-data$/i.test(v)
    }
  }

  if ( request.get("body") ){
    if (isMultipartFormDataRequest && ["POST", "PUT", "PATCH"].includes(request.get("method"))) {
      for( let [ k,v ] of request.get("body").entrySeq()) {
        let extractedKey = extractKey(k).replace(/'/g, "'\\''")
        addNewLine()
        addIndent()
        addWordsWithoutLeadingSpace("-F")
        if (v instanceof win.File) {
          addWords(`'${extractedKey}=@${v.name.replace(/'/g, "'\\''")}${v.type ? `;type=${v.type.replace(/'/g, "'\\''")}` : ""}'`)
        } else {
          addWords(`'${extractedKey}=${v.replace(/'/g, "'\\''")}'`)
        }
      }
    } else {
      addNewLine()
      addIndent()
      addWordsWithoutLeadingSpace("-d")
      let reqBody = request.get("body")
      if (!Map.isMap(reqBody)) {
        if(typeof reqBody !== "string") {
          reqBody = JSON.stringify(reqBody)
        }
        addWords(`'${reqBody.replace(/'/g, "'\\''")}'`)
      } else {
        let curlifyToJoin = []
        for (let [k, v] of request.get("body").entrySeq()) {
          let extractedKey = extractKey(k)
          if (v instanceof win.File) {
            curlifyToJoin.push(`  "${extractedKey}": {\n    "name": "${v.name}"${v.type ? `,\n    "type": "${v.type}"` : ""}\n  }`)
          } else {
            curlifyToJoin.push(`  "${extractedKey}": ${JSON.stringify(v, null, 2).replace(/(\r\n|\r|\n)/g, "\n  ")}`)
          }
        }
        addWords(`'{\n${curlifyToJoin.join(",\n").replace(/'/g, "'\\''")}\n}'`)
      }
    }
  } else if(!request.get("body") && request.get("method") === "POST") {
    addNewLine()
    addIndent()
    addWordsWithoutLeadingSpace("-d", "\"\"")
  }

  return curlified
}
