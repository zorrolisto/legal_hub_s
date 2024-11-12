export const colors = [
  {
    id: "1",
    name: "Lavender",
    lightColor: "#A4BDFC",
    darkColor: "#7986CB",
  },
  {
    id: "2",
    name: "Sage",
    lightColor: "#7AE7BF",
    darkColor: "#33B679",
  },
  {
    id: "3",
    name: "Grape",
    lightColor: "#DBADFF",
    darkColor: "#8E24AA",
  },
  {
    id: "4",
    name: "Flamingo",
    lightColor: "#FF887C",
    darkColor: "#E67C73",
  },
  {
    id: "5",
    name: "Banana",
    lightColor: "#FBD75B",
    darkColor: "#F6BF26",
  },
  {
    id: "6",
    name: "Tangerine",
    lightColor: "#FFB878",
    darkColor: "#F4511E",
  },
  {
    id: "7",
    name: "Peacock",
    lightColor: "#46D6DB",
    darkColor: "#039BE5",
  },
  {
    id: "8",
    name: "Graphite",
    lightColor: "#E1E1E1",
    darkColor: "#616161",
  },
  {
    id: "9",
    name: "Blueberry",
    lightColor: "#5484ED",
    darkColor: "#3F51B5",
  },
  {
    id: "10",
    name: "Basil",
    lightColor: "#51B749",
    darkColor: "#0B8043",
  },
  {
    id: "11",
    name: "Tomato",
    lightColor: "#DC2127",
    darkColor: "#D50000",
  },
];

export const getColorMasParecidoByHex = (hex: string) => {
  const color = colors.reduce((prev, curr) => {
    const prevDiff = Math.abs(
      parseInt(prev.lightColor.replace("#", ""), 16) -
        parseInt(hex.replace("#", ""), 16),
    );
    const currDiff = Math.abs(
      parseInt(curr.lightColor.replace("#", ""), 16) -
        parseInt(hex.replace("#", ""), 16),
    );
    return prevDiff < currDiff ? prev : curr;
  });
  return color;
};
