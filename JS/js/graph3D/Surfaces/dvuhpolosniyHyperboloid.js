Surfaces.prototype.dvuhpolosniyHyperboloid = (count = 20) => {
    const points = [];
    const edges = [];
    const polygons = [];

    //рисуем точки
    const a = 0.5;
    const b = 0.5;
    const c = 0.5;

    const size = 10;
    const delta = Math.PI * 2 / count;

    //рисуем точки
    for (let i = 0; i < 2 * Math.PI; i += delta) {
        for (let j  = -Math.PI; j < Math.PI; j+= delta) {
          
            const x = a * Math.cosh(j);
            const y = b * Math.sin(i) * Math.cosh(j);
            const z = c * Math.cos(i) * Math.sinh(j) ;
            points.push(new Point(x, y, z));
            points.push(new Point(-x, y, z));

        }
    }

    //рисуем рёбра
    for(i = 0; i < points.length; i++){
        if(i % 2 === 0 && i + 2 < points.length && (i + 2) % count !== 0){
         edges.push(new Edge(i, i + 2))
        }

        if(i % 2 === 0 && i + count * 2 < points.length){
            edges.push(new Edge(i, i + count * 2))
        }
        //дырка
        edges.push(new Edge(0,count * (count * 2 - 2)))



        if(i % 2 !== 0 && i + 2 < points.length && (i + 2) % count !== 1){
            edges.push(new Edge(i, i + 2))
        }
   
        if(i % 2 !== 0 && i + count * 2 < points.length){
            edges.push(new Edge(i, i + count * 2))
        }
        //дырка
        edges.push(new Edge(1,count * (count * 2 - 2) + 1))
    }
    


    return new Subject(points, edges, polygons);
}