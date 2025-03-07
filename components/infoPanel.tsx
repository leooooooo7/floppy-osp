import {attribute, attributes} from '../public/types'

export default function InfoPanel (props: {att:attribute}) {
  let path: string = props.att.path;
  const dataRenderMethod: string = props.att.dataRenderMethod;
  const clearPath = (path: string):string => {
    console.log('path', path);
    let newPath = path.split('\\')
    console.log('newPath', newPath);
    for (let i = 0; i < newPath.length; i++) {
      if (newPath[i] === 'pages') {
        newPath = newPath.slice(i);
      }
    }
    const newPathString = newPath.join('\\')
    return newPathString;
  }
  path = clearPath(path);

  return (
    <>
      <div className='card-content'>
        <div>Path: {path}</div>
        <div>Data Render Method: {dataRenderMethod}</div>
        <div>Props:</div>
      </div>
    </>
  )
}