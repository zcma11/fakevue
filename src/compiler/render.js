export default function createRenderFunction (code) {
  try {
    return new Function(code)
  } catch (err) {
    throw new Error(`error: ${err}, code: ${code}`)
  }
}