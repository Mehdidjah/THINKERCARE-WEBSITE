import React from "react";

type BrandAndEquity = {
  name: string;
  image: string;
  href: string;
  description: string;
};

type Props = {
  data: BrandAndEquity[];
};

export default function DataGrid<T>({ data }: Props) {
  const renderItem = (row: BrandAndEquity, index: number) => {
    return (
      <a
        key={index}
        href={row.href}
        target="_blank"
        className="scale-100 hover:scale-110 transition-all duration-300"
        title={row.description}
      >
        <span className="sr-only">{row.name}</span>
        <img src={row.image} alt={row.name} className="size-48 lg:size-72 grayscale brightness-75 transition-all duration-300" />
      </a>
    );
  };
  if (data.length % 2 === 0) {
    return (
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center items-center gap-x-16 gap-y-4 max-w-7xl mx-auto px-8 sm:px-4 py-4">
        {data.map(renderItem)}
      </div>
    );
  } else {
    const lastItem = data[data.length - 1];
    const restItems = data.slice(0, -1);
    return (
      <>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center items-center gap-x-16 gap-y-4 max-w-7xl mx-auto px-8 sm:px-4 py-4">
          {restItems.map(renderItem)}
        </div>
        <div className="flex justify-center items-center max-w-7xl mx-auto px-8 sm:px-4 pb-4">
          {renderItem(lastItem, data.length - 1)}
        </div>
      </>
    );
  }
}
