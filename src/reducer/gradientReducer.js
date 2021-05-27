export const gradientReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        loading: true,
        error: ""
      }
    case "FETCH_SUCCESS":
      return {
        ...state,
        gradient: [...action.payload],
        loading: false,
      }
    case "FETCH_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload
      }
    default:
      throw new Error(`Unsupported action type ${action.type} in gradientReducer`)
  }
}