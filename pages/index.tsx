import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Tree from 'react-d3-tree'

export default function Home() {
  const test = {
    name: 'Pages',
    children: [
      {
        name: "_app.tsx",
        attributes: {
            path: "pages/_app.tsx",
        },
          children:[]
      },
       {
        name: "index.tsx",
        attributes: {
            path: "pages/index.tsx",
        },
          children:[]
      },
           {
        name: "api",
        attributes: {
            path: "pages/api",
        },
             children: [
               {
                 name: "hello.ts",
                 attributes: {
                   path:"pages/api/hello.ts"
                 },
               }
          ]
      },
    ]
  }

  return (
    <div id='treeWrapper' style={{ width: '50em', height: '20em' }}>
      <Tree data = {test} />
      </div>
  )
}
