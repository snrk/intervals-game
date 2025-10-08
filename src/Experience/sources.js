export const loaderSources = [
    {
        name: 'gKeyModel',
        type: 'gltfModel',
        path: 'models/gKey.glb'
    }
]

export const mainSources = [
    {
        name: "environmentMapTexture",
        type: "cubeTexture",
        path: [
            'textures/environmentMaps/0/px.jpg',
            'textures/environmentMaps/0/nx.jpg',
            'textures/environmentMaps/0/py.jpg',
            'textures/environmentMaps/0/ny.jpg',
            'textures/environmentMaps/0/pz.jpg',
            'textures/environmentMaps/0/nz.jpg'
        ],
    },
    {
        name: "stageModel",
        type: "gltfModel",
        path: "models/scene.glb "
    },
    { name: 'pianoC1', type: 'audio', path: 'samples/C1.wav' },
    { name: 'pianoC2', type: 'audio', path: 'samples/C2.wav' },
    { name: 'pianoC3', type: 'audio', path: 'samples/C3.wav' },
    { name: 'pianoC4', type: 'audio', path: 'samples/C4.wav' }
] 