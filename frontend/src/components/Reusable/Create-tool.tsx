function CreateTool( { funcionSeccion } : { funcionSeccion : () => void } ){
    return(
        <>
            <button onClick={funcionSeccion}>+</button>
        </>
    );
}

export default CreateTool;