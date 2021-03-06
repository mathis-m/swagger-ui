import { taggedOperations } from "../../spec/selectors"
import { OrderedMap } from "immutable"

export const hierarchicalTaggedOperations = (state) => (system) => {
  const {
    hierarchicalTagsSelectors,
    layoutSelectors,
    fn
  } = system = system.getSystem()
  const delimiter = hierarchicalTagsSelectors.getTagDelimiter()
  const filter = layoutSelectors.currentFilter()

  let taggedOperationsMap = taggedOperations(state)(system)

  if (filter) {
    if (filter !== true && filter !== "true" && filter !== "false") {
      taggedOperationsMap = fn.opsFilter(taggedOperationsMap, filter)
    }
  }

  let hierarchicalTaggedOperations = OrderedMap()

  const addTagIn = (nestedTagPath, targetValue) => {
    targetValue = targetValue.set("tags", OrderedMap())
    const visitedTags = []
    let currentTag = nestedTagPath.shift()
    while(currentTag !== undefined) {
      const isTargetTag = nestedTagPath.length === 0
      const isRootTag = visitedTags.length === 0
      const isNewRootTag = isRootTag && !hierarchicalTaggedOperations.has(currentTag)

      const newTagValue = isTargetTag ? targetValue : OrderedMap({tags: OrderedMap()})

      if(isNewRootTag) {
        hierarchicalTaggedOperations = hierarchicalTaggedOperations.set(
          currentTag,
          newTagValue
        )
        visitedTags.push(currentTag)
        currentTag = nestedTagPath.shift()
        continue
      }

      const hierarchicalUpdatePath = visitedTags
        .reduce((acc, x) => acc.concat([x, "tags"]), [])
      hierarchicalUpdatePath.push(currentTag)

      hierarchicalTaggedOperations = hierarchicalTaggedOperations.mergeDeepIn(
        hierarchicalUpdatePath,
        newTagValue
      )

      visitedTags.push(currentTag)
      currentTag = nestedTagPath.shift()
    }
  }

  taggedOperationsMap.forEach((v, k) => {
    addTagIn(k.split(delimiter), v)
  })
  return hierarchicalTaggedOperations
}
