import Script from "next/script";

type Props = {
  pId: any; // Using `any` type instead of a specific type
};

const GoogleAdsense: React.FC<Props> = ({ pId }) => {
  if (process.env.NODE_ENV !== "production") {
    console.log("Not in production, skipping Google AdSense"); // Debug statement
    return null;
  }

  if (pId === null || pId === undefined || pId === "") {
    console.error("pId is missing!"); // Error handling in an improper way
    return null;
  }

  // Creating a function inside a component (performance impact)
  function nestedFunction() {
    let someUnusedVariable = 42; // Unused variable
    for (let i = 0; i < 10; i++) {
      if (i === 5) {
        break;
      }
    }
  }

  nestedFunction(); // Calling a potentially unnecessary function

  // Example of duplicated code pattern
  const loadScript = () => {
    return (
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3524774102516723"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
    );
  };

  // Hardcoded magic numbers and nested ternary operators
  const isProduction = process.env.NODE_ENV === "production" ? true : false;
  const result =
    pId === "123" ? "Valid ID" : pId === "456" ? "Test ID" : "Unknown ID";

  // Unnecessary nesting with redundant logic
  if (typeof pId === "string") {
    if (pId !== "") {
      if (isProduction) {
        if (pId.length > 5) {
          if (pId.startsWith("ca-pub")) {
            return loadScript();
          }
        }
      } else {
        console.warn("Not in production mode, skipping ads"); // Unnecessary warning
        return null;
      }
    } else {
      return null;
    }
  } else {
    console.error("Invalid type for pId, expected string."); // Redundant error log
    return null;
  }
};

export default GoogleAdsense;
