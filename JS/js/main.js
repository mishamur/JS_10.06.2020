window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

window.onload = function () {
    const WINDOW = {
        LEFT: -10,
        BOTTOM: -10,
        WIDTH: 20,
        HEIGHT: 20,
        P1: new Point(-10, 10, -30),// левый верхний угол
        P2: new Point(-10, -10, -30),//левый нижний угол
        P3: new Point(10, -10, -30),// правый нижний угол

        CENTER: new Point(0, 0, -30), // центр окошка, через которое видим мир
        CAMERA: new Point(0, 0, -50) // точка, из которой смотрим на мир
    };
    const ZOOM_OUT = 1.1;
    const ZOOM_IN = 0.9;

    const sur = new Surfaces;
    const canvas = new Canvas({ width: 600, height: 600, WINDOW, callbacks: { wheel, mouseup, mousedown, mousemove, mouseleave, move /* //... */ } });
    const graph3D = new Graph3D({ WINDOW });
    const ui = new UI({ callbacks: { move, printPoints, printPolygons, printEdges } });

    // сцена
    const SCENE = [
         //sur.sphera(40, 12, new Point(0, 0, 0), '00ffff'),
         sur.sphera(20, 5, new Point(0, 0, 0), '00ffff'/*, { rotateOz: new Point(0, 0, 0) }*/),
        // sur.ellipsoid(),
        // sur.hyperbolicParaboloid(),
        // sur.ellipticheskiyParaboloid(),
        // sur.cone(),
        // sur.dvuhpolosniyHyperboloid(),
        // sur.hyperbolicCylinder(),
        // sur.ellipticheskiyCilindr(),
        // sur.parabolicheskiyCilindr(),
        //Сатурн------------------------------------------------
        //sur.bublik(20, 10, new Point(0, 0, 0), 'ffd480'),
        //sur.sphera(20, 6, new Point(0, 0, 0), '7a5c1f')
        //------------------------------------------------------
        // sur.saturn(),

    ];
    const LIGHT = new Light(-20, 2, -20, 200) //Источник света
   // const LIGHT = new Light(0, 0, 0, 200) //Источник света
   
    let canRotate = false;
    let canPrint = {
        points: false,
        edges: false,
        polygons: true
    }

    // about callbacks
    function wheel(event) {
        // const delta = (event.wheelDelta > 0) ? ZOOM_IN : ZOOM_OUT;
        // graph3D.zoomMatrix(delta);
        // SCENE.forEach(subject => {
        //     subject.points.forEach(point => graph3D.transform(point));
        //     if (subject.animation) {
        //         for (let key in subject.animation) {
        //             graph3D.transform(subject.animation[key]);
        //         }
        //     }
        // });
        const delta = (event.wheelDelta > 0) ? ZOOM_IN : ZOOM_OUT;
        graph3D.zoomMatrix(delta);
     
        graph3D.transform(WINDOW.CAMERA);
        graph3D.transform(WINDOW.CENTER);
        graph3D.transform(WINDOW.P1);
        graph3D.transform(WINDOW.P2);
        graph3D.transform(WINDOW.P3);
    }

    function mouseup() {
        canRotate = false;
    }

    function mouseleave() {
        mouseup();
    }

    function mousedown() {
        canRotate = true;
    }


    function mousemove(event) {//крутим фигуры мышкой
        if(canRotate){
            let alphaX = -0.01 * event.movementX;
            let alphaY = -0.01 * event.movementY;
            graph3D.moveMatrix(alphaX,alphaY,0);
            SCENE.forEach(subject => {
                if(subject.animation){
                    for(let key in subject.animation){
                        graph3D.transform(subject.animation[key]);
                    }
                }
            });
            graph3D.transform(WINDOW.CAMERA);
            graph3D.transform(WINDOW.CENTER);
            graph3D.transform(WINDOW.P1);
            graph3D.transform(WINDOW.P2);
            graph3D.transform(WINDOW.P3);
        }
        
    }

    function printPoints(value) {
        canPrint.points = value;
    }

    function printEdges(value) {
        canPrint.edges = value;
    }

    function printPolygons(value) {
        canPrint.polygons = value;
    }

    function move(direction) {
        switch(direction){
            case 'up': graph3D.rotateOxMatrix(-Math.PI / 180); break;
            case 'down': graph3D.rotateOxMatrix(Math.PI / 180); break;

            case 'left': graph3D.rotateOyMatrix(Math.PI / 180); break;
            case 'right': graph3D.rotateOyMatrix(-Math.PI / 180); break;
        }

        graph3D.transform(WINDOW.CAMERA);
        graph3D.transform(WINDOW.CENTER);
        graph3D.transform(WINDOW.P1);
        graph3D.transform(WINDOW.P2);
        graph3D.transform(WINDOW.P3);

        // if (direction === 'up' || direction === 'down') {
        //     const delta = (direction === 'up') ? 0.1 : -0.1;
        //     graph3D.moveMatrix(0, delta, 0)
        //     SCENE.forEach(subject => subject.points.forEach(point => graph3D.transform(point)));
        //     render();
        // }

        // if (direction === 'left' || direction === 'right') {
        //     const delta = (direction === 'right') ? 0.1 : -0.1;
        //     graph3D.moveMatrix(delta, 0, 0);
        //     SCENE.forEach(subject => subject.points.forEach(point => graph3D.transform(point)));
        //     render();
        // }
    }

    // about render

    function PrintAllPolygons() {
        if (canPrint.polygons) {//print polygons

            const polygons = [];
            SCENE.forEach(subject => {
                //отсечь невидимые грани
                //graph3D.calcCorner(subject, WINDOW.CAMERA);
                //algorithm paitner 
                graph3D.calcDistance(subject, WINDOW.CAMERA, 'distance'); //record distance 
                graph3D.calcDistance(subject, LIGHT, 'lumen');
                for (let i = 0; i < subject.polygons.length; i++) {
                    if (subject.polygons[i].visible) {
                        const polygon = subject.polygons[i];

                        const point1 = graph3D.getProection(subject.points[polygon.points[0]]);
                        const point2 = graph3D.getProection(subject.points[polygon.points[1]]);
                        const point3 = graph3D.getProection(subject.points[polygon.points[2]]);
                        const point4 = graph3D.getProection(subject.points[polygon.points[3]]);
                      
                        let { r, g, b } = polygon.color;
                        const lumen = graph3D.calcIllumination(polygon.lumen, LIGHT.lumen);
                        r = Math.round(r * lumen);
                        g = Math.round(g * lumen);
                        b = Math.round(b * lumen);
                        polygons.push({
                            points: [point1, point2, point3, point4],
                            color: polygon.rgbToHex(r, g, b),
                            distance: polygon.distance
                        });
                    }
                }
            });
            //отрисовка всех полигонов
            polygons.sort((a, b) => b.distance - a.distance); //sort polygons
            polygons.forEach(polygon => canvas.polygon(polygon.points, polygon.color));

        }
    }
    function printSubject(subject) {
        // print edges
        if(canPrint.edges){
            for (let i = 0; i < subject.edges.length; i++) {
                const edges = subject.edges[i];
                const point1 = subject.points[edges.p1];
                const point2 = subject.points[edges.p2];
                canvas.line(graph3D.getProection(point1).x, graph3D.getProection(point1).y, graph3D.getProection(point2).x, graph3D.getProection(point2).y);
            }
        }
        // print points
        if(canPrint.points){
            for (let i = 0; i < subject.points.length; i++) {
                const points = subject.points[i];
                canvas.point(graph3D.getProection(points).x, graph3D.getProection(points).y);
            }
        }
    }



    function render() {
        canvas.clear();
        PrintAllPolygons();
        SCENE.forEach(subject => printSubject(subject));
        canvas.text(WINDOW.LEFT, WINDOW.WIDTH / 2 - 1, FPSout);
        canvas.render();
    }

    function animation() {
        //закрутим фигуру
        SCENE.forEach(subject => {
            if (subject.animation) {
                for (let key in subject.animation) {

                    const { x, y, z } = subject.animation[key];
                    const xn = WINDOW.CENTER.x - x;
                    const yn = WINDOW.CENTER.y - y;
                    const zn = WINDOW.CENTER.z - z;

                    // //переместить центр объекта в центр координат  
                    // graph3D.moveMatrix(xn, yn, zn);
                    // subject.points.forEach(point => graph3D.transform(point));

                    // //повращать объект
                    // const alpha = Math.PI / 180;
                    // graph3D[`${key}Matrix`](alpha);
                    // subject.points.forEach(point => graph3D.transform(point));

                    // //переместить центр объекта после вращения обратно обратно
                    // graph3D.moveMatrix(-xn, -yn, -zn);

                    // subject.points.forEach(point => graph3D.transform(point));

                    
                    const alpha = Math.PI / 180;
                    graph3D.animateMatrix(xn, yn, zn, key, alpha, -xn, -yn, -zn);
                    subject.points.forEach(point => graph3D.transform(point));
                }
            }
        });
    }

    setInterval(animation, 10)

    let FPS = 0;
    let FPSout = 0
    let timestamp = (new Date()).getTime();
    (function animloop() {
        //Считаем FPS
        FPS++;
        const currentTimestamp = (new Date()).getTime();
        if (currentTimestamp - timestamp >= 1000) {
            timestamp = currentTimestamp;
            FPSout = FPS;
            FPS = 0;
        }
        //Рисуем сцену
        graph3D.calcPlaneEquation(); // получить и записать плоскость экрана
        graph3D.calcWindowVectors(); // вычислить вектора экрана
        render();
        requestAnimationFrame(animloop);
    })();



}; 