# js-template-engine

**Ne pas oublier que ce moteur est une bicyclette.**

Éviter l'élément html [< template >](https://developer.mozilla.org/fr/docs/Web/HTML/Element/template). J'ai remarqué des problèmes avec. Mieux vaut utiliser [< script type="text/template" >](https://developer.mozilla.org/fr/docs/Web/HTML/Element/script)

afficher la variable telle quelle :

```
[[- .... ]]
```

afficher la variable échappée : 

```
[[= .... ]]
```

une expression JS :

```
[[ .... ]]
```

À noter que si par exemple, on doit utiliser la méthode [Array.join()](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/join), on doit faire : 

```
[[- ['a', 'b'].join(', ') ]]
```

