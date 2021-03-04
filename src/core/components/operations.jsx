import React from "react"
import PropTypes from "prop-types"
import Im, { OrderedMap } from "immutable"

const SWAGGER2_OPERATION_METHODS = [
  "get", "put", "post", "delete", "options", "head", "patch"
]

const OAS3_OPERATION_METHODS = SWAGGER2_OPERATION_METHODS.concat(["trace"])


export default class Operations extends React.Component {

  static propTypes = {
    specSelectors: PropTypes.object.isRequired,
    specActions: PropTypes.object.isRequired,
    oas3Actions: PropTypes.object.isRequired,
    getComponent: PropTypes.func.isRequired,
    oas3Selectors: PropTypes.func.isRequired,
    layoutSelectors: PropTypes.object.isRequired,
    layoutActions: PropTypes.object.isRequired,
    authActions: PropTypes.object.isRequired,
    authSelectors: PropTypes.object.isRequired,
    getConfigs: PropTypes.func.isRequired,
    fn: PropTypes.func.isRequired,
    hierarchicalLevel: PropTypes.number,
    hierarchicalTag: PropTypes.number,
  };

  render() {
    let {
      specSelectors,
      getComponent,
      oas3Selectors,
      layoutSelectors,
      layoutActions,
      getConfigs,
      fn,
      hierarchicalLevel,
      hierarchicalTag
    } = this.props
    hierarchicalLevel = hierarchicalLevel || 1
    const hierarchicalTagsConfig = getConfigs().hierarchicalTags || true // TODO: remove true

    let taggedOps = hierarchicalTagsConfig
      ? !hierarchicalTag
        ? specSelectors.hierarchicalTaggedOperations()
        : specSelectors.getHierarchicalTagsFor(hierarchicalTag)
      : specSelectors.taggedOperations()

    console.log(hierarchicalTag || "root", taggedOps.toJS())
    const OperationContainer = getComponent("OperationContainer", true)
    const OperationTag = getComponent("OperationTag")
    const Operations = getComponent("operations", true)

    let {
      maxDisplayedTags,
    } = getConfigs()

    let filter = layoutSelectors.currentFilter()

    if (filter && !hierarchicalTagsConfig) {
      if (filter !== true && filter !== "true" && filter !== "false") {
        taggedOps = fn.opsFilter(taggedOps, filter)
      }
    }

    if (maxDisplayedTags && !isNaN(maxDisplayedTags) && maxDisplayedTags >= 0) {
      taggedOps = taggedOps.slice(0, maxDisplayedTags)
    }

    const indentStyle = {
      width: 45 * (hierarchicalLevel) + "px"
    }
    debugger
    return (
        <div>
          {
            taggedOps.map( (tagObj, tag) => {
              const operations = tagObj.get("operations", OrderedMap())
              let hierarchicalTagPath = tagObj.getIn(["tagDetails", "name"], tag)
              return (
                <OperationTag
                  key={"operation-" + tag}
                  tagObj={tagObj}
                  tag={tag}
                  oas3Selectors={oas3Selectors}
                  layoutSelectors={layoutSelectors}
                  layoutActions={layoutActions}
                  getConfigs={getConfigs}
                  getComponent={getComponent}
                  specUrl={specSelectors.url()}>
                  {
                    operations.map( op => {
                      const path = op.get("path")
                      const method = op.get("method")
                      const specPath = Im.List(["paths", path, method])


                      // FIXME: (someday) this logic should probably be in a selector,
                      // but doing so would require further opening up
                      // selectors to the plugin system, to allow for dynamic
                      // overriding of low-level selectors that other selectors
                      // rely on. --KS, 12/17
                      const validMethods = specSelectors.isOAS3() ?
                            OAS3_OPERATION_METHODS : SWAGGER2_OPERATION_METHODS

                      if(validMethods.indexOf(method) === -1) {
                        return null
                      }

                      return <OperationContainer
                                 key={`${path}-${method}`}
                                 specPath={specPath}
                                 op={op}
                                 path={path}
                                 method={method}
                                 tag={tag}
                                 />
                    }).toArray()
                  }
                  <div style={{ display: "flex" }}>
                    {
                      hierarchicalTagsConfig && (
                        <div style={indentStyle}></div>
                      )
                    }
                    <div style={{ flexGrow: 1 }}>
                      <Operations
                        key={"operations-" + hierarchicalTagPath}
                        hierarchicalLevel={hierarchicalLevel + 1}
                        hierarchicalTag={hierarchicalTagPath}
                      />
                    </div>

                  </div>
                </OperationTag>
              )
            }).toArray()
          }

          { hierarchicalLevel === 1 && taggedOps.size === 0 ? <h3> No operations defined in spec! </h3> : null }
        </div>
    )
  }

}

Operations.propTypes = {
  layoutActions: PropTypes.object.isRequired,
  specSelectors: PropTypes.object.isRequired,
  specActions: PropTypes.object.isRequired,
  layoutSelectors: PropTypes.object.isRequired,
  getComponent: PropTypes.func.isRequired,
  fn: PropTypes.object.isRequired
}
