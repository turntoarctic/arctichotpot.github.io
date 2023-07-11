import{_ as a,o as p,c as s,a as e}from"./app-ec29cce2.js";const n="/assets/input-url-process-738f41a2.png",t="/assets/keyword-search-26fff6ca.png",r="/assets/response-data-redirect-307d1a6d.png",l="/assets/response-data-200-24f75935.png",o="/assets/response-data-type-html-ca54c76b.png",i="/assets/response-data-type-stream-2f99f193.png",c="/assets/render-process-equal-7494b5c2.png",d="/assets/render-process-different-02a9a30e.png",u="/assets/update-status-a7b5bacc.png",g="/assets/render-finish-8eac4023.png",h={},k=e('<h1 id="导航流程-从输入url到页面展示这中间发生了什么" tabindex="-1"><a class="header-anchor" href="#导航流程-从输入url到页面展示这中间发生了什么" aria-hidden="true">#</a> 导航流程：从输入URL到页面展示这中间发生了什么</h1><p>“在浏览器里，从输入URL到页面展示，这中间发生了什么？”，这是一道经典的面试题，能比较全面地考察应聘者知识的掌握程度，其中涉及到了网络、操作系统、Web等一系列的知识。所以我在面试应聘者时也必问这道题，但遗憾的是大多数人只能回答其中部分零散的知识点，并不能将这些知识点串联成线，无法系统而又全面地回答这个问题。</p><p>那么今天我们就一起来探索下这个流程，下图是我梳理出的“从输入URL到页面展示完整流程示意图”：</p><p><img src="'+n+'" alt="从输入URL到页面展示完整流程示意图"></p><p>从图中可以看出，整个过程需要各个进程之间的配合，所以在开始正式流程之前，我们还是先来快速回顾下浏览器进程、渲染进程和网络进程的主要职责。</p><ul><li><p>浏览器进程主要负责用户交互、子进程管理和文件储存等功能。</p></li><li><p>网络进程是面向渲染进程和浏览器进程等提供网络下载功能。</p></li><li><p>渲染进程的主要职责是把从网络下载的HTML、JavaScript、CSS、图片等资源解析为可以显示和交互的页面。因为渲染进程所有的内容都是通过网络获取的，会存在一些恶意代码利用浏览器漏洞对系统进行攻击，所以运行在渲染进程里面的代码是不被信任的。这也是为什么 Chrome 会让渲染进程运行在安全沙箱里，就是为了保证系统的安全。</p></li></ul><p>回顾了浏览器的进程架构后，我们再结合上图来看下这个完整的流程，可以看出，整个流程包含了许多步骤，我把其中几个核心的节点用蓝色背景标记出来了。这个过程可以大致描述为如下：</p><ul><li><p>首先，用户从浏览器进程里输入请求信息。</p></li><li><p>然后，网络进程发起URL请求。</p></li><li><p>服务器响应URL请求之后，浏览器进程就又要开始准备渲染进程了。</p></li><li><p>渲染进程准备好之后，需要先向渲染进程提交页面数据，我们称之为提交文档阶段。</p></li><li><p>渲染进程接收完文档信息之后，便开始解析页面和加载子资源，完成页面的渲染。</p></li></ul><p>这其中，用户发出URL请求到页面开始解析的这个过程，就叫做导航。下面我们来详细分析下这些步骤，同时也就解答了开头所说的那道经典的面试题。</p><h2 id="从输入url到页面展示" tabindex="-1"><a class="header-anchor" href="#从输入url到页面展示" aria-hidden="true">#</a> 从输入URL到页面展示</h2><p>知道了浏览器的几个主要进程的职责之后，那么接下来，我们就从浏览器的地址栏开始讲起。</p><h3 id="_1-用户输入" tabindex="-1"><a class="header-anchor" href="#_1-用户输入" aria-hidden="true">#</a> 1.用户输入</h3><p>当用户在地址栏中输入一个查询关键字时，地址栏会判断输入的关键字是搜索内容，还是请求的URL。</p><ul><li><p>如果是搜索内容，地址栏会使用浏览器默认的搜索引擎，来合成新的带搜索关键字的URL。</p></li><li><p>如果判断输入内容符合URL规则，比如输入的是 time.geekbang.org，那么地址栏会根据规则，把这段内容加上协议，合成为完整的URL，如 https://time.geekbang.org。</p></li></ul><p>当用户输入关键字并键入回车之后，浏览器便进入下图的状态：</p><p><img src="'+t+`" alt="关键字搜索"></p><p>从图中可以看出，当浏览器刚开始加载一个地址之后，标签页上的图标便进入了加载状态。但此时图中页面显示的依然是之前打开的页面内容，并没立即替换为极客时间的页面。因为需要等待提交文档阶段，页面内容才会被替换。</p><h3 id="_2-url请求过程" tabindex="-1"><a class="header-anchor" href="#_2-url请求过程" aria-hidden="true">#</a> 2.URL请求过程</h3><p>接下来，便进入了页面资源请求过程。这时，浏览器进程会通过进程间通信（IPC）把URL请求发送至网络进程，网络进程接收到URL请求后，会在这里发起真正的URL请求流程。那具体流程是怎样的呢？</p><p>首先，网络进程会查找本地缓存是否缓存了该资源。如果有缓存资源，那么直接返回资源给浏览器进程；如果在缓存中没有查找到资源，那么直接进入网络请求流程。这请求前的第一步是要进行DNS解析，以获取请求域名的服务器IP地址。如果请求协议是HTTPS，那么还需要建立 TLS（安全传输层协议） 连接。</p><p>接下来就是利用IP地址和服务器建立TCP连接。连接建立之后，浏览器端会构建请求行、请求头等信息，并把和该域名相关的Cookie等数据附加到请求头中，然后向服务器发送构建的请求信息。</p><p>服务器接收到请求信息后，会根据请求信息生成响应数据（包括响应行、响应头和响应体等信息），并发给网络进程。等网络进程接收了响应行和响应头之后，就开始解析响应 头的内容了。（为了方便讲述，下面我将服务器返回的响应头和响应行统称为响应头）</p><h4 id="_1-重定向" tabindex="-1"><a class="header-anchor" href="#_1-重定向" aria-hidden="true">#</a> (1) 重定向</h4><p>在接收到服务器返回的响应头后，网络进程开始解析响应头，如果发现返回的状态码是301或者302，那么说明服务器需要浏览器重定向到其他URL。这时网络进程会从响应头的Location字段里面读取重定向的地址，然后再发起新的HTTP或者HTTPS请求，一切又重头开始了。</p><p>比如，我们在终端里输入以下命令：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>curl <span class="token operator">-</span><span class="token constant">I</span> <span class="token literal-property property">http</span><span class="token operator">:</span><span class="token operator">/</span><span class="token regex"><span class="token regex-delimiter">/</span><span class="token regex-source language-regex">time.geekbang.org</span><span class="token regex-delimiter">/</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p><code>curl -I + URL</code> 的命令是接收服务器返回的响应头的信息。执行命令后，我们看到服务器返回的响应头信息如下：</p><p><img src="`+r+`" alt="响应头重定向"></p><p>从图中可以看出，极客时间服务器会通过重定向的方式把所以HTTP请求转换为HTTPS请求。也就是说你使用HTTP向极客时间服务器请求时，服务器会返回一个包含301或者302状态码响应头，并把响应头的Location字段填上HTTPS的地址，这就是告诉了浏览器要重新导航到新的地址上。</p><p>下面我们再使用HTTPS协议对极客时间发起请求，看看服务器的响应头信息是什么样子的。</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>curl <span class="token operator">-</span><span class="token constant">I</span> <span class="token literal-property property">https</span><span class="token operator">:</span><span class="token operator">/</span><span class="token regex"><span class="token regex-delimiter">/</span><span class="token regex-source language-regex">time.geekbang.org</span><span class="token regex-delimiter">/</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>我们看到服务器返回如下信息：</p><p><img src="`+l+`" alt="响应头200"></p><p>从图中可以看出，服务器返回的响应头的状态码是200，这是告诉浏览器一切正常，可以继续往下处理该请求了。</p><p>好了，以上是重定向内容的介绍。现在你应该理解了，在导航过程中，如果服务器响应行的状态码包含了301、302一类的跳转信息，浏览器会跳转到新的地址继续导航；如果响应行是200，那么表示浏览器可以继续处理该请求。</p><h4 id="_2-响应数据类型处理" tabindex="-1"><a class="header-anchor" href="#_2-响应数据类型处理" aria-hidden="true">#</a> (2) 响应数据类型处理</h4><p>在处理了跳转信息之后，我们继续导航流程的分析。URL请求的数据类型，有时候是一个下载类型，有时候是正常的HTML页面，那么浏览器是如何区分它们的呢？</p><p>答案是 <code>Content-Type</code>。Content-Type 是HTTP头中一个非常重要的字段，它告诉浏览器服务器返回的响应体数据是什么类型，然后浏览器会根据 Content-Type 的值来决定如何显示响应体的内容。</p><p>这里我们还是以极客时间为例，看看极客时间官网返回的 Content-Type 的值是什么。在终端输入以下命令：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>curl <span class="token operator">-</span><span class="token constant">I</span> <span class="token literal-property property">https</span><span class="token operator">:</span><span class="token operator">/</span><span class="token regex"><span class="token regex-delimiter">/</span><span class="token regex-source language-regex">time.geekbang.org</span><span class="token regex-delimiter">/</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>返回信息如下图：</p><p><img src="`+o+`" alt="响应头类型html"></p><p>从图中可以看到，响应头中的 Content-Type 字段的值是 text/html，这就是告诉浏览器，服务器返回的数据是HTML格式。</p><p>接下来我们再来利用curl来请求极客时间安装包的地址，如下所示：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>curl <span class="token operator">-</span><span class="token constant">I</span> <span class="token literal-property property">https</span><span class="token operator">:</span><span class="token operator">/</span><span class="token operator">/</span>res001<span class="token punctuation">.</span>geekbang<span class="token punctuation">.</span>org<span class="token operator">/</span>apps<span class="token operator">/</span>geektime<span class="token operator">/</span>android<span class="token operator">/</span><span class="token number">2.3</span><span class="token number">.1</span><span class="token operator">/</span>official<span class="token operator">/</span>geektime_2<span class="token punctuation">.</span><span class="token number">3.1_20190527</span><span class="token operator">-</span>2136_offical<span class="token punctuation">.</span>apk
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>请求后返回的响应头信息如下：</p><p><img src="`+i+'" alt="响应头类型stream"></p><p>从返回的响应头信息来看，其 Content-Type 的值是 application/octet-stream，显示数据是字节流类型的，通常情况下，浏览器会按照下载类型来处理该请求。</p><p>需要注意的是，如果服务器配置 Content-Type 不正确，比如将 text/html 类型配置成 application/octet-stream 类型，那么浏览器可能会曲解文件内容，比如会将一个本来是用来展示的页面，变成了一个下载文件。</p><p>所以，不同 Content-Type 的后续处理流程也截然不同。如果 Content-Type 字段的值被浏览器判断为下载类型，那么该请求会被提交给浏览器的下载管理器，同时该URL请求的导航流程就此结束。但如果是HTML，那么浏览器则会继续进行导航流程。由于Chrome的页面渲染是运行在渲染进程中的，所以接下来就需要准备渲染进程了。</p><h3 id="_3-准备渲染进程" tabindex="-1"><a class="header-anchor" href="#_3-准备渲染进程" aria-hidden="true">#</a> 3.准备渲染进程</h3><p>默认情况下，Chrome会为每个页面分配一个渲染进程，也就是说，每打开一个新页面就会配套创建一个新的渲染进程。但是，也有一些例外，在某些情况下，浏览器会让多个页面直接运行在同一渲染进程中。</p><p>比如我从极客时间的首页打开了另外一个页面——算法训练营，我们看下图的Chrome的任务管理器截图：</p><p><img src="'+c+`" alt="相同的渲染进程"></p><p>从图中可以看出，打开的这三个页面都是运行在同一渲染进程中，进程ID是23601。</p><p>那么什么情况下多个页面会同时运行在一个渲染进程中呢？</p><p>要解决这个问题，我们就需要先了解下什么是同一站点（same-site）。具体地讲，我们将“同一站点”定义为根域名（例如，geekbang.org）加上协议（例如，https:// 或者 http://），还包含了该根域名下的所有子域名和不同的端口，比如下面这三个：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token literal-property property">https</span><span class="token operator">:</span><span class="token operator">/</span><span class="token operator">/</span>time<span class="token punctuation">.</span>geekbang<span class="token punctuation">.</span>org
<span class="token literal-property property">https</span><span class="token operator">:</span><span class="token operator">/</span><span class="token operator">/</span>www<span class="token punctuation">.</span>geekbang<span class="token punctuation">.</span>org
<span class="token literal-property property">https</span><span class="token operator">:</span><span class="token operator">/</span><span class="token operator">/</span>www<span class="token punctuation">.</span>geekbang<span class="token punctuation">.</span>org<span class="token operator">:</span><span class="token number">8080</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>它们都是属于同一站点，因为它们的协议都是HTTPS，而且根域名也都是 geekbang.org。</p><p>Chrome的默认策略是，每个标签对应一个渲染流程。但如果从一个页面打开了另一个新页面，而新页面和当前页面属于同一站点的话，那么新页面会复用父页面的渲染进程。官方把这个默认策略叫 process-per-site-instance。</p><p>那若新页面和当前页面不属于同一站点，情况又会发生什么样的变化呢？比如我通过极客邦页面里的链接打开InfoQ的官网（ https://www.infoq.cn/ ），因为 infoq.cn 和 geekbang.org 不属于同一站点，所以 infoq.cn 会使用一个新的渲染进程，你可以参考下图。</p><p><img src="`+d+'" alt="不同的渲染进程"></p><p>从图中任务管理器可以看出：由于极客邦和极客时间的标签页拥有相同的协议和根域名，所以它们属于同一站点，并运行在同一渲染进程中；而 infoq.cn 的根域名不同于 geekbang.org，也就是说infoQ和极客邦不属于同一站点，因此它们会运行在两个不同的渲染进程之中。</p><p>总结来说，打开一个新页面采用的渲染进程策略是：</p><ul><li><p>通常情况下，打开新的页面都会使用单独的渲染进程。</p></li><li><p>如果A页面打开B页面，且A和B都属于同一站点的话，那么B页面复用A页面的渲染进程；如果是其他情况，浏览器进程则会为B创建一个新的渲染进程。</p></li></ul><p>渲染进程准备好之后，还不能立即进入文档解析状态，因为此时的文档数据还在网络进程中，并没有提交给渲染进程，所以下一步就进入了提交文档阶段。</p><h3 id="_4-提交文档" tabindex="-1"><a class="header-anchor" href="#_4-提交文档" aria-hidden="true">#</a> 4.提交文档</h3><p>首先要明确一点，这里的“文档”是指URL请求的响应体数据。</p><ul><li><p>“提交文档”的消息是由浏览器进程发出的，渲染进程接收到“提交文档”的消息后，会和网络进程建立传输数据的“管道”。</p></li><li><p>等文档数据传输完成之后，渲染进程会返回“确认提交”的消息给浏览器进程。</p></li><li><p>浏览器进程在收到“确认提交”的消息后，会更新浏览器界面状态，包括了安全状态、地址栏的URL、前进后退的历史状态，并更新Web界面。</p></li></ul><p>更新内容如下图所示：</p><p><img src="'+u+'" alt="提交文档后更新状态"></p><p>这也就解释了为什么在浏览器的地址栏里面输入了一个地址后，之前的页面没有立马消失，而是要加载一会儿才会更新页面。</p><p>到这里，一个完整的导航流程就“走”完了，这之后就要进入渲染阶段了。</p><h3 id="_5-渲染阶段" tabindex="-1"><a class="header-anchor" href="#_5-渲染阶段" aria-hidden="true">#</a> 5.渲染阶段</h3><p>一旦文档被提交，渲染进程便开始页面解析和子资源加载了，关于这个阶段的完整过程，我会在下一篇文章中来专门介绍。这里你只需要先了解一旦页面生成完成，渲染进程会发送一个消息给浏览器进程，浏览器接收到消息后，会停止标签图标上的加载动画。如下所示：</p><p><img src="'+g+'" alt="渲染完成"></p><p>至此，一个完整的页面就生成了。那文章开头的“从输入URL到页面展示，这中间发生了什么？”这个过程极其“串联”的问题也就解决了。</p><h2 id="总结-从输入url到页面展示-这中间发生了什么" tabindex="-1"><a class="header-anchor" href="#总结-从输入url到页面展示-这中间发生了什么" aria-hidden="true">#</a> 总结：从输入URL到页面展示，这中间发生了什么</h2><ul><li><p>用户输入URL并回车。</p></li><li><p>浏览器进程检查URL，组装协议，构成完整的URL。</p></li><li><p>浏览器进程通过进程间通信（IPC）把URL请求发送给网络进程。</p></li><li><p>网络进程接收到URL请求后检查本地缓存是否缓存了该请求资源，如果有则将该资源返回给浏览器进程。</p></li><li><p><code>如果没有，网络进程向web服务器发起http请求（网络请求），请求流程如下：</code></p><ul><li><p>进行DNS解析，获取服务器IP地址，端口（端口是通过DNS解析获取的吗？这里有个疑问）。</p></li><li><p>利用IP地址和服务器建立TCP连接。</p></li><li><p>构建请求头信息。</p></li><li><p>发送请求头信息。</p></li><li><p>服务器响应后，网络进程接收响应头和响应信息，并解析响应内容。</p></li></ul></li><li><p><code>网络进程解析响应流程：</code></p><ul><li><p>检查状态码，如果是301/302，则需要重定向，从Location字段中读取地址，重新进行第4步（301/302跳转也会读取本地缓存吗？这里有个疑问），如果是200，则继续处理请求。</p></li><li><p>200响应处理：检查响应类型 Content-Type，如果是字节流类型，则将请求提交给下载管理器，该导航流程结束，不再进行后续的渲染，如果是html则通知浏览器进程准备渲染进程准备进行渲染。</p></li></ul></li><li><p><code>准备渲染进程：</code></p><ul><li>浏览器进程检查当前URL是否和之前打开的渲染进程根域名是否相同，如果相同，则复用原来的进程，如果不同，则开启新的渲染进程。</li></ul></li><li><p><code>传输数据、更新状态：</code></p><ul><li><p>渲染进程准备好后，浏览器向渲染进程发起“提交文档”的消息，渲染进程接收到消息和网络进程建立传输数据的“管道”。</p></li><li><p>渲染进程接收完数据后，向浏览器发送“确认提交”消息。</p></li><li><p>浏览器进程接收到确认消息后更新浏览器界面状态：安全、地址栏URL、前进后退的历史状态、更新web页面。</p></li></ul></li></ul><h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结" aria-hidden="true">#</a> 总结</h2><p>好了，今天就到这里，下面我来简单总结下这篇文章的要点：</p><ul><li><p>服务器可以根据响应头来控制浏览器的行为，如跳转、网络数据类型判断。</p></li><li><p>Chrome默认采用每个标签对应一个渲染进程，但是如果两个页面属于同一站点，那这两个标签会使用同一渲染进程。</p></li><li><p>浏览器的导航过程涵盖了从用户发起请求到提交文档给渲染进程的中间所以阶段。</p></li><li><p>导航流程很重要，它是网络加载流程和渲染流程之间的一座桥梁，如果你理解了导航流程，那么你就能完整串起来整个页面显示流程，这对于你理解浏览器的工作原理起到了点睛的作用。</p></li></ul>',82),m=[k];function b(_,v){return p(),s("div",null,m)}const f=a(h,[["render",b],["__file","index.html.vue"]]);export{f as default};
