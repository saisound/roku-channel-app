const getImageAsArray = async ({ url, urlSuffix, callback }) => {
  const reqUrl = "https://cigars.roku.com/v1/" + encodeURIComponent(url + urlSuffix);
  console.log("---")
  console.log("original full-res image url: ", url);
  console.log("fetching from cigars as: ", reqUrl);
  const response = await fetch(reqUrl);
  const blob = await response.blob();
  const buffer = await blob.arrayBuffer();
  const imgAsArray = new Uint8Array(buffer);

  // get width and height then call callback
  const img = new Image();

  img.addEventListener("load", () => {
    const width = img.width;
    const height = img.height;
    callback({ imgAsArray, width, height });
  })

  img.src = window.URL.createObjectURL(blob)
}

export default getImageAsArray;