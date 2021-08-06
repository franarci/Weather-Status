var probar_apiOpenWeather = (function() {
    let ciudadInput = document.getElementById("ciudad");   
    let newClima = document.getElementById("getClima");
    let actualizar = document.getElementById("actualizar");
    let api_key;
    let sortOptions = ["temperatura", "humedad", "nombre", "id"];
    
    let autoRefresh;
    let lastSort;
    let asc; 
    let timer;
    
    

    const armarHeader = (function() {
        const masFrioContainer = document.createElement("div");
        masFrioContainer.setAttribute("class", "mas-frio-container");
        const masHumedoContainer = document.createElement("div");
        masHumedoContainer.setAttribute("class", "mas-humedo-container");
        document.querySelector("header").appendChild(masFrioContainer);
        document.querySelector("header").appendChild(masHumedoContainer);
    })();
    
    var footer = (function() {
        const footer =document.createElement("footer");
        document.body.appendChild(footer);
        const borrarTodo = document.createElement("button");
        borrarTodo.classList.add("btn");
        borrarTodo.classList.add("btn-danger");
        borrarTodo.classList.add("borrar-todo");
        borrarTodo.appendChild(document.createTextNode("Limpiar"));
        footer.appendChild(borrarTodo);

        borrarTodo.addEventListener("click", ()=>{
            const climas = document.querySelectorAll(".ciudad-container");
            climas.forEach(clima => {
                document.getElementById("resultados").removeChild(clima);
            });
            try {
                localStorage.setItem("climas", []);
            } catch{}
        });
    })();

    const actualizarClimas = () => {
        const climas = document.querySelectorAll(".ciudad-container");
        climas.forEach(clima => {
            document.getElementById("resultados").removeChild(clima);
            obtenerEstadoDelClima(clima.getAttribute("nombre"));
        });
    }

    const actualizarCada5= () =>{
        timer= setInterval(actualizarClimas, 300000);
    };
    actualizarCada5();

    
    
    const armarMenuDesplegable = (function() {
        const dropMenu= document.createElement("button");
        dropMenu.setAttribute("class", "dropbtn");
        dropMenu.appendChild(document.createTextNode("Ordenar"));
        dropMenu.onclick = () => {dropSelector.classList.toggle("show")}
        const dropdownContainer = document.querySelector(".dropdown-container");
        dropdownContainer.appendChild(dropMenu);
        const dropSelector = document.createElement("div");
        dropSelector.setAttribute("class", "dropdown-content");
        dropdownContainer.appendChild(dropSelector);

        sortOptions.forEach(option => {
            const opt = document.createElement("a");
            opt.setAttribute("class", "sort-option");
            //opt.setAttribute("option", option);
            const text = document.createTextNode(option);
            opt.appendChild(text);
            opt.onclick = () => {
                ordenarClimasPor(option);
                dropSelector.classList.toggle("show");
            };            
            dropSelector.appendChild(opt);
        });
        
    })();

    function ordenarClimasPor(opcion) {
        let climas = document.querySelectorAll(".ciudad-container");
        climas.forEach(clima => {            
            document.getElementById("resultados").removeChild(clima);
        });

        climas = Array.from(climas);
        climas.sort((clima1, clima2) => asc? clima2.getAttribute(opcion).localeCompare(clima1.getAttribute(opcion)) :
                                             clima1.getAttribute(opcion).localeCompare(clima2.getAttribute(opcion))
        ); 
        climas.forEach(clima => {
            document.getElementById("resultados").appendChild(clima);
        });
        asc = !asc;
        lastSort = opcion;
        try {
            localStorage.setItem("lastSort", lastSort);
            localStorage.setItem("asc", asc);
        } catch{}
    }

    function avisarDesactualizado(ciudad){
       
    }


    const obtenerFondo = (id, main) =>{
        const nubes = {
            "Parcial" : "https://www.israel21c.org/wp-content/uploads/2018/12/main-pic-4-1168x657.jpg",
            "Total" : "https://s3-us-west-2.amazonaws.com/melingoimages/Images/17425.jpg"
        } 

        const fondos = {
            "Thunderstorm" : "https://ichef.bbci.co.uk/news/976/cpsprodpb/5C5F/production/_119574632_gettyimages-819817820.jpg",
            "Drizzle" : "https://www.collinsdictionary.com/images/full/drizzle_223387984.jpg",
            "Rain" : "http://1.bp.blogspot.com/-MIM6sX0hrtQ/ULRa2JGXn7I/AAAAAAAAAF4/Ky4ubPw-jqs/s1600/rain.jpeg",
            "Snow" : "https://www.sciencenewsforstudents.org/wp-content/uploads/2021/02/1030_LL_snow.jpg",
            "Clear" : "https://images.pexels.com/photos/281260/pexels-photo-281260.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
            "Clouds" : id<=802 ? nubes["Parcial"] : nubes["Total"],
            "Mist" : "https://www.advancednanotechnologies.com/wp-content/uploads/2019/05/iStock-1055906130-1080x675.jpg",
            "Fog" : "https://www.advancednanotechnologies.com/wp-content/uploads/2019/05/iStock-1055906130-1080x675.jpg",
            "Tornado" : "https://www.nationalgeographic.com.es/medio/2020/06/15/tornado_19e1b619_1200x630.jpg",
        }

        let fondo = fondos[main];
        if(fondo == null){
            fondo = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7QMkS1S073qkeXxCB2GX9_rgcqhN-L3eG9Wfn1aATrn9l1bMBI3V6NUOS9IMAvUzie3_I-2EArA3tAA&usqp=CAU";
        }
        return fondo;
    }
    
    const actualizarHeader = () => {
        const climas = Array.from(document.querySelectorAll(".ciudad-container"));
        if(climas.length != 0){
            const getMasFrio = (c1,c2) => {
                let ret = c1.getAttribute("temperatura") < c2.getAttribute("temperatura") ? c1 : c2;

                return ret;
            }

            const getMasHumedo = (c1,c2) => {
                let ret = c1.getAttribute("humedad") > c2.getAttribute("humedad") ? c1 : c2;
  
                return ret;
            }
            const masFrio = climas.reduce(getMasFrio);
            const masHumedo = climas.reduce(getMasHumedo);

            document.querySelector(".mas-frio-container").textContent = "Ciudad mas fria: "+ masFrio.getAttribute("nombre");           
            document.querySelector(".mas-humedo-container").textContent= "Ciudad mas humeda: "+masHumedo.getAttribute("nombre");
        }
    }

    const armarClima = (mainData) =>{    
            let climas = [];
            try{
 
                let climasCargados = JSON.parse(localStorage.getItem("climas"));
                climasCargados.forEach(clima => {
                climas.push(clima);         
            });
            } catch{}
            if(!pertenece(mainData, climas)){
                climas.push(mainData);
            }
            try{
                localStorage.setItem("climas", JSON.stringify(climas));
            } catch{}
            
            const resContainer =document.createElement("div");
            resContainer.setAttribute("id", `${mainData.Id}`);
            resContainer.setAttribute("class", "ciudad-container");
            resContainer.setAttribute("nombre",`${mainData.Name}`);
            const h2 = document.createElement("h2");
            const borrar = document.createElement("div");
            borrar.setAttribute("class", "borrar");
            const x = document.createElement("label");
            x.setAttribute("class", "x")
            x.appendChild(document.createTextNode("X"))
            borrar.appendChild(x);
            h2.appendChild(document.createTextNode(mainData.Name));
            const cabezal = document.createElement("div");
            cabezal.setAttribute("class", "cabezal");
            resContainer.style.backgroundImage = `url(${obtenerFondo(mainData.weatherId, mainData.Clima)})`;
           

            delete mainData.Name;
            delete mainData.Id;
            delete mainData.weatherId;

            cabezal.appendChild(h2);
            cabezal.appendChild(borrar);
            
            resContainer.appendChild(cabezal);       
            
            //mostrar atributos
            Object.keys(mainData).forEach(dato => {
                     resContainer.setAttribute(dato, mainData[dato]);
                     const label = document.createElement("label");
                     label.setAttribute("class", `${dato}`);
                     let t =document.createTextNode(dato+`: `+mainData[dato]);
                     label.appendChild(t);
                     resContainer.appendChild(label);
            });
            
            setTimeout(()=>{
                    const aviso = document.createElement("div");
                    aviso.setAttribute("class", "aviso");
                    aviso.textContent= "Han pasado 30 minutos desde la ultima actualizacion";
                    const footer = document.querySelector("footer");
                    footer.appendChild(aviso);          
            }, 1800000);
            
            document.getElementById("resultados").appendChild(resContainer);
            
            borrar.addEventListener("click", () =>{
                document.getElementById("resultados").removeChild(resContainer);
                let climas = JSON.parse(localStorage.getItem("climas"));
                climas = climas.filter(clima => resContainer.getAttribute("nombre") != clima.Name);
                localStorage.setItem("climas", JSON.stringify(climas));
                actualizarHeader();
            });
            actualizarHeader();
            
    }
    const pertenece = (e, lista) =>{
        return (lista.find(elem => elem.Name == e.Name) != null);
    }
    
    var cargarDesdeLocalStorage = (function(){
        try{
            autoRefresh = localStorage.getItem("autoRefresh")== null ? true : localStorage.getItem("autoRefresh");
            lastSort = localStorage.getItem("lastSort")== null ? "" : localStorage.getItem("lastSort");
            asc = localStorage.getItem("asc")== null ? true : localStorage.getItem("asc");
            let climasCargados = JSON.parse(localStorage.getItem("climas"));
            climasCargados.forEach(clima => {
               armarClima(clima);
            });
        } catch(e) {
            if(e.message.startsWith("Failed to read the 'localStorage'")){
                autoRefresh = true;
                lastSort = "";
                asc = true;
                alert("ATENCION: localStorage esta desactivado. Los cambios no se persistiran!");
            }
        }
    })();

    var armarCheckbox = (function() {
        const container = document.createElement("div");
        const cb = document.createElement("input");
        cb.setAttribute("type", "checkbox");
        try{
            if(localStorage.getItem("autoRefresh")==null){cb.setAttribute("Checked", "")} ;
        } catch {
            cb.setAttribute("Checked", "");
        }
        container.appendChild(cb);
        container.appendChild(document.createTextNode("auto-refresh"));
        document.getElementById("weather-form-container").appendChild(container);
        
        
        
        cb.addEventListener("click", () =>{
            autoRefresh = !autoRefresh;
            localStorage.setItem("autoRefresh", autoRefresh);  
            if(autoRefresh){
               actualizarCada5();
            } else {
               clearInterval(timer)
            }
        });
        
    })();

    
    
    function obtenerEstadoDelClima(ciudad){
            const request = new XMLHttpRequest;
            const type =  isNaN(ciudad)  ? "q" : "id" ;
            const url= `https://api.openweathermap.org/data/2.5/weather?${type}=${ciudad}&appid=${api_key}`;
            
            request.open("GET", url);
            request.addEventListener("load", () => {
               let json =  JSON.parse(request.response);
               const existe = document.getElementById(`${json.id}`);
               if(!existe){
                let mainData = {};      
                mainData["Clima"]= json.weather[0].main;
                mainData["Temperatura"]= json.main.temp - 273+"°C";
                mainData["Humedad"]= json.main.humidity+"%";
                mainData["Name"] = json.name;
                mainData["Id"] = json.id;
                mainData["weatherId"] = json.weather[0].id;

                armarClima(mainData);
               }

               
               
            }); 
        
            request.send();
    }
 
    

    newClima.addEventListener("click", () => {
       obtenerEstadoDelClima(ciudadInput.value);

       ciudadInput.value = null;
    });

    

    actualizar.addEventListener("click", actualizarClimas);


})();
 
