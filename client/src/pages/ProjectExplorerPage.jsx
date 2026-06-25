import React,
{
 useEffect,
 useState
}
from "react";

import axios
from "axios";

function RenderNode({
 node,
 onSelect
}) {

 return (

  <div>

   <div
    className="tree-item"
    onClick={() =>
      node.type === "file" &&
      onSelect(node)
    }
   >

    {
      node.type === "folder"
      ? "📁"
      : "📄"
    }

    {" "}

    {node.name}

   </div>

   {
    node.children &&
    (
     <div
      className="tree-child"
     >
      {
       node.children.map(
        (child,index)=>(
         <RenderNode
          key={index}
          node={child}
          onSelect={
            onSelect
          }
         />
       ))
      }
     </div>
    )
   }

  </div>

 );

}

function ProjectExplorerPage() {

 const [tree,setTree] =
 useState([]);

 const [selected,
 setSelected] =
 useState(null);

 useEffect(() => {

  loadTree();

 },[]);

 const loadTree =
 async () => {

  const res =
   await axios.post(

    "http://localhost:5000/api/project-tree",

    {
      projectPath:
      localStorage.getItem(
        "projectPath"
      )
    }

   );

  setTree(
   res.data.tree
  );

 };

 return (

  <div
   className="explorer-layout"
  >

   <div
    className="explorer-sidebar"
   >

    <h2>
      Project Explorer
    </h2>

    {
     tree.map(
      (node,index)=>(
       <RenderNode
        key={index}
        node={node}
        onSelect={
          setSelected
        }
       />
      )
     )
    }

   </div>

   <div
    className="explorer-content"
   >

    {
      selected
      ? (
        <>
         <h2>
          {selected.name}
         </h2>

         <p>
          Path:
         </p>

         <pre>
          {selected.path}
         </pre>
        </>
      )
      : (
        <h2>
          Select Any File
        </h2>
      )
    }

   </div>

  </div>

 );

}

export default
ProjectExplorerPage;